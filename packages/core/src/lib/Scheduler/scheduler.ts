import { ClientSession, MongoClient } from 'mongodb'
import * as Db from 'src/db'
import { DbPath, PluginInstance } from 'src/db/plugins'
import {
  PluginServiceDefinition,
  loadPluginServiceDefinitions,
  loadPluginServiceDefinitionById
} from 'src/lib/PluginManager'
import { isSyncDue } from './isSyncDue'
import { SyncInfo, SyncSuccessInfo } from '@mydata/sdk'

const liveIntervals: NodeJS.Timeout[] = []
const liveServices: PluginServiceDefinition[] = []

export async function start() {
  const definitions = await loadPluginServiceDefinitions()
  if (!definitions.length) {
    return
  }

  liveServices.push(...definitions)

  const client = await Db.getClient()
  for (const definition of definitions) {
    for (const instance of definition.plugin.instances) {
      const settings = await Db.Plugins.Settings.get(client, {
        pluginName: definition.service.name,
        instanceName: instance.name
      })
      if (!settings) {
        console.warn(
          `[Scheduler] ${definition.plugin.id}->${instance.name} ❗️ Plugin can not start as it has not been configured`
        )
        continue
      }

      const interval = queueSchedule(client, definition, instance)

      liveIntervals.push(interval)
    }
  }
}

export async function stop() {
  while (liveServices.length > 0) liveServices.pop()
  liveIntervals.forEach((interval) => clearInterval(interval))
}

export async function getPluginDefinition(
  pluginId: string
): Promise<PluginServiceDefinition> {
  const existingInstance = liveServices.find(
    (instance) => instance.plugin.id === pluginId
  )
  if (existingInstance) {
    return existingInstance
  }

  const definition = await loadPluginServiceDefinitionById(pluginId)
  if (!definition) {
    return null
  }

  liveServices.push(definition)

  return definition
}

function queueSchedule(
  client: MongoClient,
  definition: PluginServiceDefinition,
  instance: PluginInstance
): NodeJS.Timeout {
  let isRunning = false

  const pluginId = definition.plugin.id
  const dbPath: DbPath = {
    pluginName: definition.service.name,
    instanceName: instance.name
  }

  async function maybeLoadData() {
    console.log(
      `[Scheduler] ${pluginId}->${instance.name}: Checking if sync is due`
    )

    const settings = await Db.Plugins.Settings.get(client, dbPath)
    const lastSyncAttempt = await Db.Plugins.Syncs.last<SyncInfo>(
      client,
      dbPath
    )
    const lastSyncSuccess = await Db.Plugins.Syncs.last<SyncSuccessInfo>(
      client,
      dbPath,
      {
        success: true
      }
    )

    const syncDue = isSyncDue(new Date(), lastSyncAttempt, settings.schedule)
    if (!syncDue) {
      console.log(`[Scheduler] ${pluginId}->${instance.name}: Sync not due yet`)
      return
    }

    console.log(`[Scheduler] ${pluginId}->${instance.name}: Will attempt sync`)

    if (isRunning) {
      console.warn(
        `[Scheduler] ${pluginId}->${instance.name}: ❗️ Last Sync is still in progress! Bailing.`
      )
      return
    }

    isRunning = true
    let dbSession: ClientSession = null
    for (const loader of definition.service.loaders) {
      try {
        console.log(
          `[Scheduler] ${pluginId}->${instance.name}->${loader.name}: Will Load Data`
        )

        const result = await loader.load(settings, {
          lastSync: lastSyncSuccess
        })

        dbSession = client.startSession()
        await dbSession.withTransaction(async () => {
          await Db.Plugins.Syncs.track(client, dbPath, {
            success: true,
            latestDate: result.lastDate,
            date: new Date()
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

        console.log(
          `[Scheduler] ${pluginId}->${instance.name}->${loader.name}: 👌 Data Load Finished`
        )
      } catch (e) {
        console.error(
          `[Scheduler] ${pluginId}->${instance.name}->${loader.name}: ❗️ Data Load Failed with error.`,
          e
        )

        await Db.Plugins.Syncs.track(client, dbPath, {
          success: false,
          date: new Date(),
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

  return setInterval(maybeLoadData, 30000)
}
