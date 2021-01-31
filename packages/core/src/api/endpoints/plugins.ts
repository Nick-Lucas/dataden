import { Express } from 'express'
import StatusCodes from 'http-status-codes'
import _ from 'lodash'

import * as Db from 'src/db'
import {
  installPlugin,
  InstallPluginError,
  PluginConflictError
} from 'src/lib/PluginManager'
import { getInstallationManager } from 'src/lib/PluginManager/getInstallationManager'
import * as Scheduler from 'src/lib/Scheduler'
import { Logger } from 'src/logging'

import { MaybeError, authenticatedEndpoint } from './common'
import {
  GetPlugins,
  GetPlugin,
  PutPlugin,
  Reload,
  PutPluginInstanceSettings,
  GetPluginInstanceSettings,
  PostInstallPlugin,
  PostForceSync,
  GetPluginUpdate
} from './plugins.types'

export function listen(app: Express, log: Logger) {
  app.post<
    void,
    MaybeError<PostInstallPlugin.Response>,
    PostInstallPlugin.Body,
    void
  >(
    PostInstallPlugin.path,
    authenticatedEndpoint(),
    async (request, response) => {
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
    }
  )

  app.get<void, MaybeError<GetPlugins.Response>, any, any>(
    GetPlugins.path,
    authenticatedEndpoint(),
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
    authenticatedEndpoint(),
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

  app.get<
    GetPluginUpdate.RouteParams,
    MaybeError<GetPluginUpdate.Response>,
    any,
    any
  >(
    GetPluginUpdate.path,
    authenticatedEndpoint(),
    async (request, response) => {
      const { pluginId } = request.params

      const plugin = await Scheduler.getPluginService(pluginId)
      if (!plugin) {
        response.sendStatus(404)
        return
      }

      try {
        const updatable = await getInstallationManager(
          plugin.definition.plugin.local,
          plugin.definition.plugin.source
        ).isUpgradePossible()

        await response.send({
          updatable
        })
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
  >(PutPlugin.path, authenticatedEndpoint(), async (request, response) => {
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

  app.post(Reload.path, authenticatedEndpoint(), async (request, response) => {
    await Scheduler.restart()

    response.sendStatus(200)
  })

  app.post<PostForceSync.RouteParams>(
    PostForceSync.path,
    authenticatedEndpoint(),
    async (request, response) => {
      const { pluginId, instanceId } = request.params

      const service = await Scheduler.getPluginService(pluginId, instanceId)
      if (!service) {
        response.status(404)
        response.send(
          `Plugin ${pluginId} with instance ${instanceId} not found`
        )
        return
      }

      // Don't await promise, this will end up in the console anyway
      service.loaderScheduler?.immediate()

      response.sendStatus(200)
    }
  )

  app.get<
    GetPluginInstanceSettings.RouteParams,
    MaybeError<GetPluginInstanceSettings.Response>,
    void,
    void
  >(
    GetPluginInstanceSettings.path,
    authenticatedEndpoint(),
    async (request, response, next) => {
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

        if (!definition) {
          response.status(404)
          response.send('Could not get Plugin instance')
          return
        }

        const defaultSettings = await definition.service.getDefaultSettings()

        const settings = await Db.Plugins.Settings.get(client, {
          pluginId: definition.plugin.id,
          instanceName: instance.name
        })

        // Merge settings onto default settings to bring forward any newly added keys
        response.send(
          _.merge(defaultSettings, settings ?? {}, { _id: undefined })
        )
      } catch (e) {
        next(e)
      }
    }
  )

  app.post<
    PutPluginInstanceSettings.RouteParams,
    MaybeError<PutPluginInstanceSettings.Response>,
    PutPluginInstanceSettings.Body,
    void
  >(
    PutPluginInstanceSettings.path,
    authenticatedEndpoint(),
    async (request, response, next) => {
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
            pluginId: definition.plugin.id,
            instanceName: instance.name
          },
          settings
        )

        await Scheduler.restart()

        response.sendStatus(200)
      } catch (e) {
        next(e)
      }
    }
  )
}
