import { DataLoader, SyncInfo } from '@dataden/sdk'
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

      // Track sync immediately
      sync.items[lastLoaderSyncIndex].syncInfo = result.syncInfo
      await Db.Plugins.Syncs.upsert(client, dbPath, sync)

      // Store data in DB
      if (result.mode === 'append') {
        await Db.Plugins.Data.append(client, dbPath, loader.name, result.data)
      } else if (result.mode === 'replace') {
        await Db.Plugins.Data.replace(client, dbPath, loader.name, result.data)
      } else {
        throw `Unknown Result Mode: "${result.mode}"`
      }

      log.info(
        `${pluginId}->${instance.name}->${loader.name}: 👌 Data Load Finished`
      )
    } catch (e) {
      log.error(
        `${pluginId}->${instance.name}->${
          loader.name
        }: ❗️ Data Load Failed with error: "${String(e)}"`
      )

      // Track failure
      const rehydrationData =
        sync.items[lastLoaderSyncIndex].syncInfo.rehydrationData
      sync.items[lastLoaderSyncIndex].syncInfo = {
        success: false,
        error: String(e),
        rehydrationData
      }
      await Db.Plugins.Syncs.upsert(client, dbPath, sync)
    }
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
