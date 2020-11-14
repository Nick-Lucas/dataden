import { Express } from 'express'
import { getClient, Plugins } from 'src/db'
import {
  installPlugin,
  loadPlugins,
  LocalPlugin,
  RegistryPlugin
} from 'src/PluginManager'

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
        const plugins = await Plugins.get(client)
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
        const plugin = await Plugins.getOne(client, pluginId)
        await response.send({ plugin })
      } catch (e) {
        response.status(500)
        await response.send(String(e))
      }
    }
  )

  app.post(`/v1.0/plugins/reload`, async (request, response) => {
    const plugins = await loadPlugins()
    const responses = await Promise.all(
      plugins.map((plugin) => plugin.loadData({ lastDate: null, settings: {} }))
    )
    response.send(JSON.stringify({ plugins, responses }))
  })
}
