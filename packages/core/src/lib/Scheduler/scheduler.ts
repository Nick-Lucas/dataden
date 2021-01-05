import * as Db from 'src/db'
import {
  PluginServiceDefinition,
  loadPluginServiceDefinitions
} from 'src/lib/PluginManager'

import { getScoped } from 'src/logging'
const log = getScoped('Scheduler')

import { PluginService, PluginServiceStatus } from './types'
import { queueLoaders } from './queueLoaders'
import { createAuthFacade } from 'src/lib/AuthFacade'

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

      const authState = await createAuthFacade(
        client,
        service
      )?.onCredentialsRequired()

      const authOK = authState ? authState.status === 'OK' : true

      if (settings && authOK) {
        service.interval = queueLoaders(client, service)
      } else {
        service.running = false

        if (!settings) {
          service.status = 'Not Configured'

          log.warn(
            `${definition.plugin.id}->${instance.name} ❗️ Plugin can not start as it has not been configured`
          )
        } else if (!authOK) {
          service.status = authState.status

          log.warn(
            `${definition.plugin.id}->${instance.name} ❗️ Plugin can not start due to an Auth issue: ${service.status}`
          )
        }
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
  const service = await getPluginService(pluginId)

  return service?.definition
}

export async function getPluginService(pluginId) {
  const existingService = services.find(
    (service) => service.definition.plugin.id === pluginId
  )

  if (!existingService) {
    await restart()
  }

  return services.find((service) => service.definition.plugin.id === pluginId)
}
