import { Common } from './common'

export namespace GetPluginAuthInteraction {
  export const path = '/v1.0/plugins/:pluginId/auth-interaction'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId) + '/auth-interaction'

  export type RouteParams = Common.PluginParams & {
    redirectUri: string
  }

  export type Response = string | null
}

export namespace PostPluginAuthInteractionResult {
  export const path = '/v1.0/plugins/:pluginId/auth-interaction'
  export const getPath = (params: RouteParams) =>
    '/v1.0/plugins/' + encodeURIComponent(params.pluginId) + '/auth-interaction'

  export type RouteParams = Common.PluginParams

  export type Body = Record<string, string>
}
