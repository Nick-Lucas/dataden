import { Common } from './common'

export namespace PostPluginAuthInteraction {
  export const path = '/v1.0/plugins/:pluginId/:instanceId/auth-interaction'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/auth-interaction'

  export type RouteParams = Common.PluginInstanceParams

  export type Body = {
    redirectUri: string
  }

  export type Response = {
    uri: string
  }
}

export namespace GetPluginAuth {
  export const path = '/v1.0/plugins/:pluginId/:instanceId/auth'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/auth'

  export type RouteParams = Common.PluginInstanceParams

  export type Response = {
    resettable: boolean
  }
}

export namespace DeletePluginAuth {
  export const path = '/v1.0/plugins/:pluginId/:instanceId/auth'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/auth'

  export type RouteParams = Common.PluginInstanceParams
}

export namespace PostPluginAuth {
  export const path = '/v1.0/plugins/:pluginId/:instanceId/auth'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/auth'

  export type RouteParams = Common.PluginInstanceParams

  export type OAuthResult = {
    code: string
    scope: string
    state: Record<string, string> & {
      pluginId: string
      instanceName: string
    }
  }

  export type Body = {
    redirectUri: string
    code: string
    scope: string
    state: Record<string, string>
  }
}
