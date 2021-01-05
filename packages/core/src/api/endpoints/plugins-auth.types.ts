import { Common } from './common'

export namespace PostPluginAuthInteraction {
  export const path = '/v1.0/plugins/:pluginId/auth-interaction'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId) + '/auth-interaction'

  export type RouteParams = Common.PluginParams

  export type Body = {
    redirectUri: string
  }

  export type Response = {
    uri: string
  }
}

export namespace PostPluginAuthInteractionResult {
  export const path = '/v1.0/plugins/:pluginId/auth-interaction-result'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' +
    encodeURIComponent(params.pluginId) +
    '/auth-interaction-result'

  export type RouteParams = Common.PluginParams

  export type Body = Record<string, string>
}
