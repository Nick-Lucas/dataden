import { Express } from 'express'
import { getClient, Plugins } from 'src/db'

interface PluginParams {
  pluginName: string
}

type MaybeErrorBody = void | string

type PutPluginRequest = Plugins.Plugin

interface GetPluginsResponse {
  plugins: Plugins.Plugin[]
}

interface GetPluginResponse {
  plugin: Plugins.Plugin
}

export function listen(app: Express) {
  app.put<void, MaybeErrorBody, PutPluginRequest, void>(
    '/v1.0/plugins',
    async (request, response) => {
      const plugin = request.body

      const client = await getClient()
      try {
        await Plugins.upsert(client, plugin)
        await response.sendStatus(200)
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
    '/v1.0/plugins/:pluginName',
    async (request, response) => {
      const { pluginName } = request.params

      const client = await getClient()
      try {
        const plugin = await Plugins.getOne(client, pluginName)
        await response.send({ plugin })
      } catch (e) {
        response.status(500)
        await response.send(String(e))
      }
    }
  )
}
