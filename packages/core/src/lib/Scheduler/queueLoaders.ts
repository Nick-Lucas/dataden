import { ClientSession, MongoClient } from 'mongodb'

import { SyncSuccessInfo } from '@dataden/sdk'

import * as Db from 'src/db'
import { DbPath } from 'src/db/plugins'
import { createAuthFacade } from 'src/lib/AuthFacade'

import { PluginService } from './types'
import { isSyncDue } from './isSyncDue'

import { getScoped, getPluginLogger } from 'src/logging'
const log = getScoped('QueueLoaders')

export function queueLoaders(
  client: MongoClient,
  pluginService: PluginService
): NodeJS.Timeout {
  let isRunning = false

  const { definition, instance } = pluginService

  const pluginId = definition.plugin.id
  const dbPath: DbPath = {
    pluginId: pluginId,
    instanceName: instance.name
  }

  async function maybeLoadData() {
    log.info(`${pluginId}->${instance.name}: Checking if sync is due`)

    const settings = await Db.Plugins.Settings.get(client, dbPath)
    const lastSyncAttempt = await Db.Plugins.Syncs.last(client, dbPath)
    const lastSyncSuccess = (await Db.Plugins.Syncs.last(client, dbPath, {
      success: true
    })) as SyncSuccessInfo

    const syncDue = isSyncDue(new Date(), lastSyncAttempt, settings.schedule)
    if (!syncDue) {
      log.info(`${pluginId}->${instance.name}: Sync not due yet`)
      return
    }

    log.info(`${pluginId}->${instance.name}: Will attempt sync`)

    if (isRunning) {
      log.warn(
        `${pluginId}->${instance.name}: ❗️ Last Sync is still in progress! Bailing.`
      )
      return
    }

    const authState = await createAuthFacade(
      client,
      pluginService
    )?.onCredentialsRequired()

    if (authState && authState.status !== 'OK') {
      // TODO: how to handle unhappy cases other than reauthentication?
      pluginService.status = 'Authentication Required'

      log.error(
        `${pluginId}->${instance.name}: Auth failed with "${authState.status}". Bailing. \n` +
          authState.error
      )

      return
    } else if (authState) {
      log.info(`${pluginId}->${instance.name}: Auth tokens loaded`)
    }

    isRunning = true
    let dbSession: ClientSession = null
    for (const loader of definition.service.loaders) {
      try {
        log.info(
          `${pluginId}->${instance.name}->${loader.name}: Will Load Data`
        )

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
            await Db.Plugins.Data.append(
              client,
              dbPath,
              loader.name,
              result.data
            )
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
        isRunning = false
        if (dbSession) {
          dbSession.endSession()
        }
      }
    }
  }

  maybeLoadData()

  return global.setInterval(maybeLoadData, 30000)
}
