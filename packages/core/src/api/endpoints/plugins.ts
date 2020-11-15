import { Express } from 'express'

import { getClient, Plugins } from 'src/db'
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

type PutPluginRequest = RegistryPlugin | LocalPlugin
type PutPluginResponse = Plugins.Plugin | string

interface GetPluginsResponse {
  plugins: Plugins.Plugin[]
}

interface GetPluginResponse {
  plugin: Plugins.Plugin
}

type GetSettingsResponse = Settings | string
type SetSettingsRequest = Settings

export function listen(app: Express) {
  app.put<void, PutPluginResponse, PutPluginRequest, void>(
    '/v1.0/plugins',
    async (request, response) => {
      const plugin = request.body

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
      const client = await getClient()
      try {
        const plugins = await Plugins.Installed.list(client)
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

      const client = await getClient()
      try {
        const plugin = await Plugins.Installed.get(client, pluginId)
        await response.send({ plugin })
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

  app.get<PluginParams, GetSettingsResponse, void, void>(
    `/v1.0/plugins/:pluginId/settings`,
    async (request, response, next) => {
      try {
        const { pluginId } = request.params

        const client = await getClient()
        const settings = await Plugins.Settings.get(client, pluginId)
        if (settings) {
          response.send(settings)
          return
        }

        const instance = await Scheduler.getInstance(pluginId)
        if (!instance) {
          response.status(404)
          response.send('Could not get Plugin instance')
          return
        }

        const defaultSettings = await instance.getDefaultSettings()

        response.send(defaultSettings)
      } catch (e) {
        next(e)
      }
    }
  )

  app.post<PluginParams, void, SetSettingsRequest, void>(
    `/v1.0/plugins/:pluginId/settings`,
    async (request, response, next) => {
      try {
        const { pluginId } = request.params
        const settings = request.body

        const client = await getClient()
        await Plugins.Settings.set(client, pluginId, settings)

        response.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
}
