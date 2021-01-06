import { Common } from './common'

export namespace PostPluginAuthInteraction {
  export const path = '/v1.0/plugins/:pluginId/:instanceName/auth-interaction'
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

export namespace PostPluginAuthInteractionResult {
  export const path =
    '/v1.0/plugins/:pluginId/:instanceName/auth-interaction-result'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/' +
    encodeURIComponent(params.instanceId) +
    '/auth-interaction-result'

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
