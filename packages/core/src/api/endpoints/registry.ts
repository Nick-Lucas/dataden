import { Express } from 'express'
import { getRegistry } from 'src/lib/PluginManager'
import { Logger } from 'src/logging'

import { authenticatedEndpoint } from './common'
import { GetRegistry } from './registry.types'

export function listen(app: Express, log: Logger) {
  app.get<void, GetRegistry.Response, void, void>(
    GetRegistry.path,
    authenticatedEndpoint(),
    async (request, response, next) => {
      try {
        const registry = await getRegistry()

        response.send(registry.data)
      } catch (e) {
        next(e)
      }
    }
  )
}
