import { ClientSession, MongoClient } from 'mongodb'

import { SyncSuccessInfo } from '@dataden/sdk'

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
  lastSyncSuccess: SyncSuccessInfo
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
    // TODO: how to handle unhappy cases other than reauthentication?
    pluginService.status = 'Authentication Required'

    log.error(
      `${pluginId}->${instance.name}: auth failed with "${authState.status}". Bailing. \n` +
        authState.error
    )

    return
  } else if (authState) {
    log.info(`${pluginId}->${instance.name}: auth refreshed`)
  }

  let dbSession: ClientSession = null
  for (const loader of definition.service.loaders) {
    try {
      log.info(`${pluginId}->${instance.name}->${loader.name}: Will Load Data`)

      const result = await loader.load(
        settings,
        {
          lastSync: lastSyncSuccess,
          auth: authState?.value ?? {}
        },
        getPluginLogger(`${pluginId}->${instance.name}->${loader.name}`)
      )

      dbSession = client.startSession()
      await dbSession.withTransaction(async () => {
        await Db.Plugins.Syncs.track(client, dbPath, {
          success: true,
          latestDate: result.lastDate,
          date: new Date().toISOString()
        })

        if (result.mode === 'append') {
          await Db.Plugins.Data.append(client, dbPath, loader.name, result.data)
        } else if (result.mode === 'replace') {
          await Db.Plugins.Data.replace(
            client,
            dbPath,
            loader.name,
            result.data
          )
        } else {
          throw `Unknown Result Mode: "${result.mode}"`
        }
      })

      log.info(
        `${pluginId}->${instance.name}->${loader.name}: 👌 Data Load Finished`
      )
    } catch (e) {
      log.error(
        `${pluginId}->${instance.name}->${
          loader.name
        }: ❗️ Data Load Failed with error: "${String(e)}"`
      )

      await Db.Plugins.Syncs.track(client, dbPath, {
        success: false,
        date: new Date().toISOString(),
        error: e
      })
    } finally {
      if (dbSession) {
        dbSession.endSession()
      }
    }
  }
}
