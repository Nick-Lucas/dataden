import { MongoClient } from 'mongodb'

import { PluginService } from 'src/lib/Scheduler/types'

import { AuthFacade } from './common'
import { createOAuth2Facade } from './OAuth2Facade'

export { AuthFacade }

export const createAuthFacade = (
  client: MongoClient,
  plugin: PluginService
): AuthFacade | null => {
  switch (plugin.definition.service.authMethod.type) {
    case 'oauth2_authorizationcode': {
      const oauth2 = plugin.definition.service.authMethod

      return createOAuth2Facade(client, plugin, oauth2)
    }

    case 'none': {
      return null
    }
  }
}
