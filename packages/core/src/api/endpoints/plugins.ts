import { Express } from 'express'

import * as Db from 'src/db'
import {
  installPlugin,
  LocalPlugin,
  RegistryPlugin
} from 'src/lib/PluginManager'
import { Scheduler } from 'src/lib/Scheduler'
import { Settings } from '@mydata/sdk'

interface PluginParams {
  pluginId: string
}

interface PluginInstanceParams extends PluginParams {
  instanceId: string
}

type PutPluginRequest = RegistryPlugin | LocalPlugin
type PutPluginResponse = Db.Plugins.Plugin | string

interface GetPluginsResponse {
  plugins: Db.Plugins.Plugin[]
}

interface GetPluginResponse {
  plugin: Db.Plugins.Plugin
}

type GetSettingsResponse = Settings | string
type SetSettingsRequest = Settings

export function listen(app: Express) {
  app.put<void, PutPluginResponse, PutPluginRequest, void>(
    '/v1.0/plugins',
    async (request, response) => {
      const plugin = request.body

      // TODO: check if already installed and reject if so

      try {
        const installedPlugin = await installPlugin(plugin)
        await response.send(installedPlugin)
      } catch (e) {
        response.status(500)
        await response.send(String(e))
      }
    }
  )

  app.get<void, GetPluginsResponse | string, any, any>(
    '/v1.0/plugins',
    async (request, response) => {
      const client = await Db.getClient()
      try {
        const plugins = await Db.Plugins.Installed.list(client)
        await response.send({ plugins })
      } catch (e) {
        response.status(500)
        await response.send(String(e))
      }
    }
  )

  app.get<PluginParams, GetPluginResponse | string, any, any>(
    '/v1.0/plugins/:pluginId',
    async (request, response) => {
      const { pluginId } = request.params

      const client = await Db.getClient()
      try {
        const plugin = await Db.Plugins.Installed.get(client, pluginId)
        await response.send({ plugin })
      } catch (e) {
        response.status(500)
        await response.send(String(e))
      }
    }
  )

  app.put<PluginParams, PutPluginResponse, Db.Plugins.Plugin, any>(
    '/v1.0/plugins/:pluginId',
    async (request, response) => {
      const { pluginId } = request.params
      const pluginDto = request.body

      if (pluginId !== pluginDto.id) {
        response.status(400)
        await response.send(`${pluginId} != ${pluginDto.id}`)
        return
      }

      const client = await Db.getClient()
      try {
        await Db.Plugins.Installed.upsert(client, pluginDto)
        await response.send(pluginDto)
      } catch (e) {
        response.status(500)
        await response.send(String(e))
      }
    }
  )

  app.post(`/v1.0/plugins/reload`, async (request, response) => {
    await Scheduler.stop()
    await Scheduler.start()

    response.sendStatus(200)
  })

  app.get<PluginInstanceParams, GetSettingsResponse, void, void>(
    `/v1.0/plugins/:pluginId/:instanceId/settings`,
    async (request, response, next) => {
      try {
        const { pluginId, instanceId } = request.params

        const client = await Db.getClient()

        const installedPlugin = await Db.Plugins.Installed.get(client, pluginId)
        const pluginInstance = installedPlugin.instances.find(
          (instance) =>
            instance.uuid === instanceId || instance.name === instanceId
        )
        if (!pluginInstance) {
          response.status(404)
          response.send(`Plugin instance id ${instanceId} not found`)
          return
        }

        const settings = await Db.Plugins.Settings.get(client, pluginInstance)
        if (settings) {
          response.send(settings)
          return
        }

        const definition = await Scheduler.getPluginDefinition(pluginId)
        if (!definition) {
          response.status(404)
          response.send('Could not get Plugin instance')
          return
        }

        const defaultSettings = await definition.service.getDefaultSettings()

        response.send(defaultSettings)
      } catch (e) {
        next(e)
      }
    }
  )

  app.post<PluginInstanceParams, void | string, SetSettingsRequest, void>(
    `/v1.0/plugins/:pluginId/:instanceId/settings`,
    async (request, response, next) => {
      try {
        const { pluginId, instanceId } = request.params
        const settings = request.body

        const client = await Db.getClient()

        const installedPlugin = await Db.Plugins.Installed.get(client, pluginId)
        const pluginInstance = installedPlugin.instances.find(
          (instance) =>
            instance.uuid === instanceId || instance.name === instanceId
        )
        if (!pluginInstance) {
          response.status(404)
          response.send(`Plugin instance id ${instanceId} not found`)
          return
        }

        await Db.Plugins.Settings.set(client, pluginInstance, settings)

        response.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
}
