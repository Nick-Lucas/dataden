import { ClientSession, MongoClient } from 'mongodb'
import * as Db from 'src/db'
import { PluginInstance } from 'src/db/plugins'
import {
  PluginServiceDefinition,
  loadPluginServiceDefinitions,
  loadPluginServiceDefinitionById
} from 'src/lib/PluginManager'
import { isSyncDue } from './isSyncDue'

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
      const settings = await Db.Plugins.Settings.get(client, instance)
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

  async function maybeLoadData() {
    console.log(`[Scheduler] ${pluginId}: Checking if sync is due`)
    const lastSync = await Db.Plugins.Syncs.last(client, instance)
    const settings = await Db.Plugins.Settings.get(client, instance)

    const syncDue = isSyncDue(new Date(), lastSync, settings.schedule)
    if (!syncDue) {
      console.log(`[Scheduler] ${pluginId}: Sync not due yet`)
      return
    }

    console.log(`[Scheduler] ${pluginId}: Will attempt sync`)

    if (isRunning) {
      console.warn(
        `[Scheduler] ${pluginId}: ❗️ Last Sync is still in progress! Bailing.`
      )
      return
    }

    isRunning = true
    let dbSession: ClientSession = null
    for (const loader of definition.service.loaders) {
      try {
        console.log(`[Scheduler] ${pluginId}: Will Load Data`)

        const result = await loader.load(settings, { lastSync: lastSync })

        dbSession = client.startSession()
        await dbSession.withTransaction(async () => {
          await Db.Plugins.Syncs.track(client, instance, {
            date: result.lastDate
          })

          if (result.mode === 'append') {
            await Db.Plugins.Data.append(
              client,
              instance,
              loader.name,
              result.data
            )
          } else if (result.mode === 'replace') {
            await Db.Plugins.Data.replace(
              client,
              instance,
              loader.name,
              result.data
            )
          } else {
            throw `Unknown Result Mode: "${result.mode}"`
          }
        })

        console.log(`[Scheduler] ${pluginId}: 👌 Data Load Finished`)
      } catch (e) {
        console.error(
          `[Scheduler] ${pluginId}: ❗️ Data Load Failed with error.`,
          e
        )
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
