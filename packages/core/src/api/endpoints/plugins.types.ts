import * as Db from 'src/db'
import { LocalPlugin, RegistryPlugin } from 'src/lib/PluginManager'
import { Settings } from '@mydata/sdk'

export interface PluginParams {
  pluginId: string
}

export interface PluginInstanceParams extends PluginParams {
  instanceId: string
}

export type PutPluginRequest = RegistryPlugin | LocalPlugin
export type PutPluginResponse = Db.Plugins.Plugin | string
export type PutPluginData = Db.Plugins.Plugin

export interface GetPluginsResponse {
  plugins: Db.Plugins.Plugin[]
}

export interface GetPluginResponse {
  plugin: Db.Plugins.Plugin
}

export type GetSettingsResponse = Settings | string
export type SetSettingsRequest = Settings
