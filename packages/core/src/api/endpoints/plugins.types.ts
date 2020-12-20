import * as Db from 'src/db'
import { Settings } from '@mydata/sdk'
import { LocalPlugin, RegistryPlugin } from 'src/lib/PluginManager'

import { Common } from './common.types'

// Other

export namespace GetPlugins {
  export const path = '/v1.0/plugins'

  export type Response = Db.Plugins.Plugin[]
}

export namespace PostInstallPlugin {
  export const path = '/v1.0/plugins/install'

  export type Body = RegistryPlugin | LocalPlugin
  export type Response = Db.Plugins.Plugin | string
}

export namespace Reload {
  export const path = '/v1.0/plugins/reload'
}

// Management

export namespace GetPlugin {
  export const path = '/v1.0/plugins/:pluginId'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId)

  export type RouteParams = Common.PluginParams

  export type Response = Db.Plugins.Plugin
}

export namespace PutPlugin {
  export const path = '/v1.0/plugins/:pluginId'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId)

  export type RouteParams = Common.PluginParams
  export type Body = Db.Plugins.Plugin

  export type Response = Db.Plugins.Plugin | string
}

export namespace GetPluginInstanceSettings {
  export const path = '/v1.0/plugins/:pluginId/:instanceId/settings'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/settings'

  export type RouteParams = Common.PluginInstanceParams

  export type Response = Settings
}

export namespace PutPluginInstanceSettings {
  export const path = '/v1.0/plugins/:pluginId/:instanceId/settings'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/settings'

  export type RouteParams = Common.PluginInstanceParams
  export type Body = Settings

  export type Response = void
}
