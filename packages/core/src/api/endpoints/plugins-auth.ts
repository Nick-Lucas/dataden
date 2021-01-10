import { Express } from 'express'

import * as Db from 'src/db'
import * as AuthFacade from 'src/lib/AuthFacade'
import * as Scheduler from 'src/lib/Scheduler'
import { Logger } from 'src/logging'

import { MaybeError, authenticatedEndpoint } from './common'
import {
  PostPluginAuthInteraction,
  PostPluginAuthInteractionResult
} from './plugins-auth.types'

export function listen(app: Express, log: Logger) {
  app.post<
    PostPluginAuthInteraction.RouteParams,
    MaybeError<PostPluginAuthInteraction.Response>,
    PostPluginAuthInteraction.Body,
    void
  >(
    PostPluginAuthInteraction.path,
    authenticatedEndpoint(),
    async (request, response) => {
      const { pluginId, instanceId } = request.params
      const { redirectUri } = request.body
      if (!pluginId || !redirectUri) {
        response.sendStatus(400)
        return
      }

      try {
        const service = await Scheduler.getPluginService(pluginId, instanceId)
        if (!service) {
          log.warn(`Could not find service for plugin "${pluginId}"`)
          response.sendStatus(404)
          return
        }

        if (service.status !== 'Authentication Required') {
          response.status(200)
          response.send('Auth Not Required (Already Authenticated)')
          return
        }

        const client = await Db.getClient()
        const authFacade = AuthFacade.createAuthFacade(client, service)
        if (!authFacade) {
          // This endpoint may be called inquisitively as it's the only
          //  way to know if interaction is required or not, so this is fine
          response.status(200)
          response.send('Auth Not Required')
          return
        }

        const authUri = await authFacade.onUserInteractionPossible({
          redirectUri
        })

        if (authUri.status !== 'OK') {
          throw authUri.error ?? 'Plugin Auth Failed'
        }

        response.send({
          uri: authUri.value
        })
      } catch (error) {
        response.status(500)
        response.send(String(error))
      }
    }
  )

  app.post<
    PostPluginAuthInteractionResult.RouteParams,
    MaybeError<void>,
    PostPluginAuthInteractionResult.Body,
    void
  >(
    PostPluginAuthInteractionResult.path,
    authenticatedEndpoint(),
    async (request, response) => {
      const { pluginId, instanceId } = request.params
      const authResultData = request.body
      if (!pluginId || !authResultData) {
        response.sendStatus(400)
        return
      }

      try {
        const service = await Scheduler.getPluginService(pluginId, instanceId)
        if (!service) {
          response.sendStatus(404)
          return
        }

        if (service.status !== 'Authentication Required') {
          response.sendStatus(200)
          return
        }

        const client = await Db.getClient()
        const authFacade = AuthFacade.createAuthFacade(client, service)
        if (!authFacade) {
          response.sendStatus(404)
          return
        }

        const result = await authFacade.onUserInteractionComplete(
          authResultData
        )

        if (result.status !== 'OK') {
          throw result.error ?? 'Plugin Auth Failed'
        }

        await Scheduler.restart()

        response.sendStatus(200)
      } catch (error) {
        response.status(500)
        response.send(String(error))
      }
    }
  )
}
