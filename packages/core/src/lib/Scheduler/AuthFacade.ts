import { MongoClient } from 'mongodb'

import { PluginService } from './types'

import { AuthFacade, createOAuth2Facade } from './AuthFacades'

export const createAuthFacade = (
  client: MongoClient,
  plugin: PluginService
): AuthFacade => {
  switch (plugin.definition.service.authMethod.type) {
    case 'oauth2_authorizationcode': {
      const oauth2 = plugin.definition.service.authMethod

      return createOAuth2Facade(client, plugin, oauth2)
    }

    case 'none': {
      return {}
    }
  }
}
