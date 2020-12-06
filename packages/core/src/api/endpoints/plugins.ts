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

        const client = await Db.getClient()
        const settings = await Db.Plugins.Settings.get(client, pluginId)
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

        const client = await Db.getClient()
        await Db.Plugins.Settings.set(client, pluginId, settings)

        response.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
}
