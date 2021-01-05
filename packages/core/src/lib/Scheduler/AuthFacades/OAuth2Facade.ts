import { MongoClient } from 'mongodb'
import * as chalk from 'chalk'

import { PluginAuth } from '@dataden/sdk'
import { Auth } from 'src/db/plugins'
import { getScoped } from 'src/logging'

import { PluginService } from '../types'
import { AuthFacade, getSettings } from './common'

export const createOAuth2Facade = (
  client: MongoClient,
  plugin: PluginService,
  oauth2: PluginAuth.OAuth2AuthMethod
): AuthFacade => {
  const log = getScoped('PluginOAuth2Facade->' + plugin.definition.plugin.id)

  return {
    onUserInteractionPossible: async ({
      /* TODO: remove this default */
      redirectUri = 'http://localhost:3000'
    }) => {
      log.info('Fetching User Interaction URI')

      const settings = await getSettings(client, plugin)

      try {
        const authUri = await oauth2.getAuthUri(settings, {
          redirectUri,
          state: { pluginId: plugin.definition.plugin.id }
        })

        log.info(
          `User Interaction URI was ${chalk.yellow(
            authUri ? '' : 'not '
          )}returned`
        )

        return {
          serviceStatus: 'OK',
          value: authUri
        }
      } catch (e) {
        log.error('getAuthUri failed. ' + String(e))

        return {
          serviceStatus: 'Error',
          error: String(e)
        }
      }
    },

    onUserInteractionComplete: async (result: Record<string, string>) => {
      const settings = await getSettings(client, plugin)

      try {
        const auth = await oauth2.exchangeAuthorizationForAuthState(
          settings,
          result
        )

        await Auth.set(
          client,
          {
            pluginId: plugin.definition.plugin.id,
            instanceName: plugin.instance.name
          },
          auth
        )

        if (!auth) {
          return {
            serviceStatus: 'Authentication Required'
          }
        }

        return {
          serviceStatus: 'OK',
          value: auth
        }
      } catch (e) {
        log.error('exchangeAuthorizationForAuthState failed. ' + String(e))

        return {
          serviceStatus: 'Error',
          error: String(e)
        }
      }
    },

    onCredentialsRequired: async () => {
      const settings = await getSettings(client, plugin)

      const auth = await Auth.get(client, {
        pluginId: plugin.definition.plugin.id,
        instanceName: plugin.instance.name
      })

      if (!auth) {
        return {
          serviceStatus: 'Authentication Required'
        }
      }

      try {
        const updatedAuth = await oauth2.updateAuthState(settings, auth)
        if (updatedAuth === 'reauthorization_required') {
          return {
            serviceStatus: 'Authentication Required'
          }
        }

        return {
          serviceStatus: 'OK',
          value: updatedAuth
        }
      } catch (e) {
        log.error('updateAuthState failed. ' + String(e))

        return {
          serviceStatus: 'Error',
          error: String(e)
        }
      }
    }
  }
}
