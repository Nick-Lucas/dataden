import { Settings } from './PluginSettings'

// TODO: also add a un/pw->key auth method, so that multiple loaders can share a token

export namespace PluginAuth {
  export type AuthMethodType = 'none' | 'oauth2_authorizationcode'
  export type AuthState<T = Record<string, string | string[]>> = T &
    Record<string, string | string[]>

  export type AuthMethod = NoAuthMethod | OAuth2AuthMethod

  //
  // None Type

  export interface NoAuthMethod {
    type: 'none'
  }

  //
  // OAuth2 Authorization Code Flow

  /**
   * Parameters to encode into the URI, they should be included as-is, though encodeURIComponent calls may be required
   */
  export interface OAuth2AuthUriParams {
    redirectUri: string
    state: string
  }

  export type OAuth2AuthResultParams = Record<string, any> & {
    redirectUri: string
    code: string
    scope: string
  }

  export interface OAuth2AuthMethod {
    type: 'oauth2_authorizationcode'

    /** Step 1: get the initial 3rd party URI to direct the user to for authorization */
    getAuthUri: (
      settings: Settings,
      params: OAuth2AuthUriParams
    ) => Promise<string>

    /** Step 2: given the final response from step 1, exchange for long lived secrets */
    exchangeAuthorizationForAuthState: <R = AuthState>(
      settings: Settings,
      recievedParams: OAuth2AuthResultParams
    ) => Promise<R>

    /** Step 3 and all future syncs: given the long lived secrets, attempt to renew the secrets, or notify the user that re-authorization is required */
    updateAuthState: <R = AuthState>(
      settings: Settings,
      authState: R
    ) => Promise<R | 'reauthorization_required'>
  }
}
