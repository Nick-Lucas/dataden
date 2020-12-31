import { Express } from 'express'
import StatusCodes from 'http-status-codes'

import * as Db from 'src/db'
import {
  installPlugin,
  InstallPluginError,
  PluginConflictError
} from 'src/lib/PluginManager'
import { Scheduler } from 'src/lib/Scheduler'
import { Logger } from 'src/logging'

import { MaybeError } from './common.types'
import {
  GetPlugins,
  GetPlugin,
  PutPlugin,
  Reload,
  PutPluginInstanceSettings,
  GetPluginInstanceSettings,
  PostInstallPlugin
} from './plugins.types'

export function listen(app: Express, log: Logger) {
  app.post<
    void,
    MaybeError<PostInstallPlugin.Response>,
    PostInstallPlugin.Body,
    void
  >(PostInstallPlugin.path, async (request, response) => {
    const plugin = request.body

    try {
      const installedPlugin = await installPlugin(plugin)

      await response.send(installedPlugin)
    } catch (e) {
      if (e instanceof PluginConflictError) {
        response.status(StatusCodes.CONFLICT)
        await response.send(String(e))
      } else if (e instanceof InstallPluginError) {
        response.status(StatusCodes.INTERNAL_SERVER_ERROR)
        await response.send(String(e))
      } else {
        log.error(`Error installing plugin: ${String(e)}`)

        response.status(StatusCodes.INTERNAL_SERVER_ERROR)
        await response.send(String(e))
      }
    }
  })

  app.get<void, MaybeError<GetPlugins.Response>, any, any>(
    GetPlugins.path,
    async (request, response) => {
      const client = await Db.getClient()
      try {
        const plugins = await Db.Plugins.Installed.list(client)
        await response.send(plugins)
      } catch (e) {
        response.status(500)
        await response.send(String(e))
      }
    }
  )

  app.get<GetPlugin.RouteParams, MaybeError<GetPlugin.Response>, any, any>(
    GetPlugin.path,
    async (request, response) => {
      const { pluginId } = request.params

      const client = await Db.getClient()
      try {
        const plugin = await Db.Plugins.Installed.get(client, pluginId)
        await response.send(plugin)
      } catch (e) {
        response.status(500)
        await response.send(String(e))
      }
    }
  )

  app.put<
    PutPlugin.RouteParams,
    MaybeError<PutPlugin.Response>,
    PutPlugin.Body,
    any
  >(PutPlugin.path, async (request, response) => {
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
      await Scheduler.restart()

      await response.send(pluginDto)
    } catch (e) {
      response.status(500)
      await response.send(String(e))
    }
  })

  app.post(Reload.path, async (request, response) => {
    await Scheduler.restart()

    response.sendStatus(200)
  })

  app.get<
    GetPluginInstanceSettings.RouteParams,
    MaybeError<GetPluginInstanceSettings.Response>,
    void,
    void
  >(GetPluginInstanceSettings.path, async (request, response, next) => {
    try {
      const { pluginId, instanceId } = request.params

      const client = await Db.getClient()

      const definition = await Scheduler.getPluginDefinition(pluginId)
      const instance = definition.plugin.instances.find(
        (instance) => instance.name === instanceId
      )
      if (!instance) {
        response.status(404)
        response.send(`Plugin instance id ${instanceId} not found`)
        return
      }

      const settings = await Db.Plugins.Settings.get(client, {
        pluginServiceName: definition.service.name,
        instanceName: instance.name
      })
      if (settings) {
        response.send(settings)
        return
      }

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
  })

  app.post<
    PutPluginInstanceSettings.RouteParams,
    MaybeError<PutPluginInstanceSettings.Response>,
    PutPluginInstanceSettings.Body,
    void
  >(PutPluginInstanceSettings.path, async (request, response, next) => {
    try {
      const { pluginId, instanceId } = request.params
      const settings = request.body

      const client = await Db.getClient()

      const definition = await Scheduler.getPluginDefinition(pluginId)

      const instance = definition.plugin.instances.find(
        (instance) => instance.name === instanceId
      )
      if (!instance) {
        response.status(404)
        response.send(`Plugin instance id ${instanceId} not found`)
        return
      }

      await Db.Plugins.Settings.set(
        client,
        {
          pluginServiceName: definition.service.name,
          instanceName: instance.name
        },
        settings
      )

      await Scheduler.restart()

      response.sendStatus(200)
    } catch (e) {
      next(e)
    }
  })
}
