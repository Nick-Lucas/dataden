import { ClientSession, MongoClient } from 'mongodb'
import * as Db from 'src/db'
import { DbPath, PluginInstance } from 'src/db/plugins'
import {
  PluginServiceDefinition,
  loadPluginServiceDefinitions,
  loadPluginServiceDefinitionById
} from 'src/lib/PluginManager'
import { isSyncDue } from './isSyncDue'
import { SyncSuccessInfo } from '@dataden/sdk'

import { getScoped, getPluginLogger } from 'src/logging'
const log = getScoped('Scheduler')

export interface PluginServiceStatus {
  running: boolean
  status: 'OK' | 'Not Started' | 'Not Configured'
}
export interface PluginService extends PluginServiceStatus {
  definition: PluginServiceDefinition
  instance: PluginInstance

  interval?: NodeJS.Timeout
}
const services: PluginService[] = []

export function getStatus(
  pluginId: string,
  instanceName: string
): PluginServiceStatus {
  const service = services.find(
    (service) =>
      service.definition.plugin.id === pluginId &&
      service.instance.name === instanceName
  )

  return service
    ? {
        running: service.running,
        status: service.status
      }
    : {
        running: false,
        status: 'Not Started'
      }
}

export async function start() {
  if (services.length > 0) {
    throw 'Cannot start plugin services as they are already started. Did you mean to restart()?'
  }

  const definitions = await loadPluginServiceDefinitions()
  if (!definitions.length) {
    return
  }

  const client = await Db.getClient()
  for (const definition of definitions) {
    for (const instance of definition.plugin.instances) {
      const service: PluginService = {
        definition,
        instance,
        running: true,
        status: 'OK'
      }

      const settings = await Db.Plugins.Settings.get(client, {
        pluginId: definition.plugin.id,
        instanceName: instance.name
      })

      if (settings) {
        service.interval = queueSchedule(client, definition, instance)
      } else {
        service.running = false
        service.status = 'Not Configured'

        log.warn(
          `${definition.plugin.id}->${instance.name} ❗️ Plugin can not start as it has not been configured`
        )
      }

      services.push(service)
    }
  }
}

export async function stop() {
  while (services.length > 0) {
    const service = services.pop()
    if (service.interval) {
      clearInterval(service.interval)
    }
  }
}

export async function restart() {
  log.info('❗️❗️❗️ Restarting all Plugins ❗️❗️❗️')
  await stop()
  await start()
}

export async function getPluginDefinition(
  pluginId: string
): Promise<PluginServiceDefinition> {
  const existingInstance = services.find(
    (service) => service.definition.plugin.id === pluginId
  )
  if (existingInstance) {
    return existingInstance.definition
  }

  const definition = await loadPluginServiceDefinitionById(pluginId)
  if (!definition) {
    return null
  }

  await restart()

  return getPluginDefinition(pluginId)
}

function queueSchedule(
  client: MongoClient,
  definition: PluginServiceDefinition,
  instance: PluginInstance
): NodeJS.Timeout {
  let isRunning = false

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
            lastSync: lastSyncSuccess
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
