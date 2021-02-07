import { DataLoader, LoaderPayload, SyncInfo } from '@dataden/sdk'
import { MongoClient } from 'mongodb'

import * as Db from 'src/db'
import { DbPath } from 'src/db/plugins'
import { createAuthFacade } from 'src/lib/AuthFacade'

import { PluginService } from 'src/lib/Scheduler'

import { getScoped, getPluginLogger } from 'src/logging'
const log = getScoped('RunLoaders')

export async function runLoaders(
  client: MongoClient,
  pluginService: PluginService,
  settings: Db.Plugins.Settings,
  lastSync: Db.Plugins.Sync
) {
  const { definition, instance } = pluginService

  const pluginId = definition.plugin.id
  const dbPath: DbPath = {
    pluginId: pluginId,
    instanceName: instance.name
  }

  const authFacade = createAuthFacade(client, pluginService)
  if (authFacade) {
    log.info(`${pluginId}->${instance.name}: attempting to refresh auth tokens`)
  }

  const authState = await authFacade?.onCredentialsRequired()
  if (authState && authState.status !== 'OK') {
    // TODO: how to handle unhappy cases including reauthentication?
    pluginService.status = 'Authentication Required'

    log.error(
      `${pluginId}->${instance.name}: auth failed with "${authState.status}". Bailing. \n` +
        authState.error
    )

    return
  } else if (authState) {
    log.info(`${pluginId}->${instance.name}: auth refreshed`)
  }

  const sync: Db.Plugins.Sync = {
    date: new Date().toISOString(),
    items: lastSync.items.map((item) => {
      // We default the sync to a series of failures, in case of a catastrophic failure, but will ideally capture any failures later
      return {
        ...item,
        syncInfo: {
          ...item.syncInfo,
          success: false,
          error: 'Unknown: Copied from previous Sync'
        }
      }
    })
  }
  Db.Plugins.Syncs.upsert(client, dbPath, sync)

  for (const loader of definition.service.loaders) {
    const [lastLoaderSync, lastLoaderSyncIndex] = getLastSyncForLoader(
      lastSync,
      loader
    )
    const updateSyncOnDb = async (syncInfo: SyncInfo) => {
      const syncItem: Db.Plugins.SyncItem = {
        type: 'loader',
        name: loader.name,
        syncInfo: syncInfo
      }

      if (lastLoaderSyncIndex >= 0) {
        sync.items[lastLoaderSyncIndex] = syncItem
      } else {
        sync.items.push(syncItem)
      }

      await Db.Plugins.Syncs.upsert(client, dbPath, sync)
    }

    try {
      log.info(`${pluginId}->${instance.name}->${loader.name}: Will Load Data`)

      const result = await loader.load(
        settings,
        {
          lastSync: lastLoaderSync,
          auth: authState?.value ?? {}
        },
        getPluginLogger(`${pluginId}->${instance.name}->${loader.name}`)
      )

      // TODO: move this inside transaction
      await updateSyncOnDb(result.syncInfo)
      await updateDataOnDb(client, loader, dbPath, result)

      log.info(
        `${pluginId}->${instance.name}->${loader.name}: 👌 Data Load Finished`
      )
    } catch (e) {
      log.error(
        `${pluginId}->${instance.name}->${
          loader.name
        }: ❗️ Data Load Failed with error: "${String(e)}"`
      )

      await updateSyncOnDb({
        success: false,
        error: String(e),
        rehydrationData:
          lastLoaderSyncIndex >= 0
            ? sync.items[lastLoaderSyncIndex].syncInfo.rehydrationData
            : {}
      })
    }
  }
}

async function updateDataOnDb(
  client: MongoClient,
  loader: DataLoader,
  dbPath: Db.Plugins.DbPath,
  result: LoaderPayload
) {
  if (result.mode === 'append') {
    await Db.Plugins.Data.append(client, dbPath, loader.name, result.data)
  } else if (result.mode === 'replace') {
    await Db.Plugins.Data.replace(client, dbPath, loader.name, result.data)
  } else {
    throw `Unknown Result Mode: "${result.mode}"`
  }
}

function getLastSyncForLoader(
  lastSync: Db.Plugins.Sync,
  loader: DataLoader
): [syncInfo: SyncInfo, index: number] {
  const lastLoaderSyncIndex = lastSync.items.findIndex(
    (sync) => sync.type === 'loader' && sync.name === loader.name
  )

  if (lastLoaderSyncIndex >= 0) {
    return [lastSync.items[lastLoaderSyncIndex].syncInfo, lastLoaderSyncIndex]
  } else {
    return [
      {
        success: true,
        rehydrationData: {}
      },
      -1
    ]
  }
}
