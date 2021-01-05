import * as Db from 'src/db'
import {
  PluginServiceDefinition,
  loadPluginServiceDefinitions,
  loadPluginServiceDefinitionById
} from 'src/lib/PluginManager'

import { getScoped } from 'src/logging'
const log = getScoped('Scheduler')

import { PluginService, PluginServiceStatus } from './types'
import { queueLoaders } from './queueLoaders'

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
        service.interval = queueLoaders(client, definition, instance)
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
