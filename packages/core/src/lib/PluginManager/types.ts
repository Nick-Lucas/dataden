import { PluginInstance } from '@mydata/sdk'

export interface CorePlugin {
  id: string
}

export interface RegistryPlugin extends CorePlugin {
  name: string
  description: string
  version: number
  source: string
  verified: boolean
  local: false
}

export interface LocalPlugin extends CorePlugin {
  name: string
  description: string
  source: string
  local: true
}

export interface Registry {
  list: RegistryPlugin[]
}

export type PluginDefinition = CorePlugin & PluginInstance