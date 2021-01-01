import { Plugin } from 'src/db/plugins'
import { PluginService } from '@dataden/sdk'

export interface CorePlugin {
  id: string
  name: string
  description: string
  source: string
  local: boolean
}

export interface RegistryPlugin extends CorePlugin {
  version: number
  verified: boolean
  local: false
}

export interface LocalPlugin extends CorePlugin {
  local: true
}

export type RegistryPluginList = RegistryPlugin[]

export interface Registry {
  list: RegistryPluginList
}

export type PluginServiceDefinition = {
  plugin: Plugin
  service: PluginService
}
