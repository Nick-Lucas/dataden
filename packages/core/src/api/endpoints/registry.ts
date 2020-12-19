import { Express } from 'express'
import { getRegistry } from 'src/lib/PluginManager'

import { RegistryResponse } from './registry.types'

export function listen(app: Express) {
  app.get<void, RegistryResponse, void, void>(
    '/v1.0/registry',
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
