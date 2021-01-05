import { Express } from 'express'

import * as Db from 'src/db'
import * as AuthFacade from 'src/lib/AuthFacade'
import * as Scheduler from 'src/lib/Scheduler'
import { Logger } from 'src/logging'

import { MaybeError, authenticatedEndpoint } from './common'
import {
  GetPluginAuthInteraction,
  PostPluginAuthInteractionResult
} from './plugins-auth.types'

export function listen(app: Express, log: Logger) {
  app.get<
    GetPluginAuthInteraction.RouteParams,
    MaybeError<GetPluginAuthInteraction.Response>,
    void,
    void
  >(
    GetPluginAuthInteraction.path,
    authenticatedEndpoint(),
    async (request, response) => {
      const { pluginId, redirectUri } = request.params
      if (!pluginId || !redirectUri) {
        response.sendStatus(400)
        return
      }

      try {
        const service = await Scheduler.getPluginService(pluginId)
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
          // This endpoint may be called inquisitively as it's the only
          //  way to know if interaction is required or not, so this is fine
          response.sendStatus(200)
          return
        }

        const authUri = await authFacade.onUserInteractionPossible({
          redirectUri
        })

        if (authUri.status !== 'OK') {
          throw authUri.error ?? 'Plugin Auth Failed'
        }

        response.send(authUri.value)
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
      const { pluginId } = request.params
      const authResultData = request.body
      if (!pluginId || !authResultData) {
        response.sendStatus(400)
        return
      }

      try {
        const service = await Scheduler.getPluginService(pluginId)
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

        response.sendStatus(200)
      } catch (error) {
        response.status(500)
        response.send(String(error))
      }
    }
  )
}
