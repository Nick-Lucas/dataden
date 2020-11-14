import { Express } from 'express'
import axios from 'axios'

const REGISTRY_URI =
  'https://raw.githubusercontent.com/Nick-Lucas/mydata/master/meta/registry.json'

interface RegistryPlugin {
  version: number
  name: string
  description: string
  source: string
  verified: boolean
}

interface RegistryResponse {
  byId: RegistryPlugin[]
}

export function listen(app: Express) {
  app.get<void, RegistryResponse, void, void>(
    '/v1.0/registry',
    async (request, response, next) => {
      try {
        const registry = await axios.get<RegistryResponse>(REGISTRY_URI, {
          validateStatus: (status) => status === 200
        })

        response.send(registry.data)
      } catch (e) {
        next(e)
      }
    }
  )
}
