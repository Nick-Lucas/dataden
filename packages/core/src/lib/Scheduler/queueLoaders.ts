import { MongoClient } from 'mongodb'

import { SyncSuccessInfo } from '@dataden/sdk'

import * as Db from 'src/db'
import { DbPath } from 'src/db/plugins'
import { runLoaders } from 'src/lib/Loaders'

import { PluginService } from './types'
import { isSyncDue } from './isSyncDue'

import { getScoped } from 'src/logging'
const log = getScoped('QueueLoaders')

export function queueLoaders(
  client: MongoClient,
  pluginService: PluginService
): NodeJS.Timeout {
  const isRunning = false

  const { definition, instance } = pluginService

  const pluginId = definition.plugin.id
  const dbPath: DbPath = {
    pluginId: pluginId,
    instanceName: instance.name
  }

  async function maybeLoadData() {
    log.info(`${pluginId}->${instance.name}: Checking if sync is due`)

    const settings = await Db.Plugins.Settings.get(client, dbPath)
    const lastSync = await Db.Plugins.Syncs.last(client, dbPath)

    const syncDue = isSyncDue(new Date(), lastSync.date, settings.schedule)
    if (!syncDue) {
      log.info(`${pluginId}->${instance.name}: Sync not due yet`)
      return
    }

    if (isRunning) {
      log.warn(
        `${pluginId}->${instance.name}: ❗️ Last Sync is still in progress! Bailing.`
      )
      return
    }

    log.info(`${pluginId}->${instance.name}: Will attempt sync`)
    try {
      await runLoaders(client, pluginService, settings, lastSync)
    } catch (e) {
      log.error(`${pluginId}->${instance.name}: error when loading data`)
      log.error(e)
    }
  }

  maybeLoadData()

  return global.setInterval(maybeLoadData, 30000)
}
