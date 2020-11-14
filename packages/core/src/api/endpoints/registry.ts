import { Express } from 'express'
import { DataPayload, DataRow } from '@mydata/sdk'

const REGISTRY_URI =
  'https://raw.githubusercontent.com/Nick-Lucas/mydata/master/meta/registry.json'

// TEST STORE
const datas = [] as DataRow[]

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

export function add(app: Express) {
  app.get<void, RegistryResponse, void, void>(
    '/v1.0/registry',
    async (request, response) => {
      const registry = await fetch(REGISTRY_URI)

      const registryData: RegistryResponse = await registry.json()

      response.send(registryData)
    }
  )
}
