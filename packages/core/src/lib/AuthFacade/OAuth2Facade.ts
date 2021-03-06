import { MongoClient } from 'mongodb'
import * as chalk from 'chalk'

import { PluginAuth } from '@dataden/sdk'
import { Auth } from 'src/db/plugins'
import { getScoped } from 'src/logging'

import { PluginService } from 'src/lib/Scheduler/types'
import { AuthFacade, getSettings } from './common'

export const createOAuth2Facade = (
  client: MongoClient,
  plugin: PluginService,
  oauth2: PluginAuth.OAuth2AuthMethod
): AuthFacade => {
  const log = getScoped('PluginOAuth2Facade->' + plugin.definition.plugin.id)

  return {
    onReset: async () => {
      log.info('Resetting Auth State')

      Auth.reset(client, {
        pluginId: plugin.definition.plugin.id,
        instanceName: plugin.instance.name
      })
    },

    onUserInteractionPossible: async ({ redirectUri }) => {
      log.info('Fetching User Interaction URI')

      const settings = await getSettings(client, plugin)

      try {
        const authUri = await oauth2.getAuthUri(settings, {
          redirectUri,
          state: JSON.stringify({
            pluginId: plugin.definition.plugin.id,
            instanceName: plugin.instance.name
          })
        })

        log.info(
          `User Interaction URI was ${chalk.yellow(
            authUri ? '' : 'not '
          )}returned`
        )

        return {
          status: 'OK',
          value: authUri
        }
      } catch (e) {
        log.error(e)

        return {
          status: 'Error',
          error: String(e)
        }
      }
    },

    onUserInteractionComplete: async (
      result: PluginAuth.OAuth2AuthResultParams
    ) => {
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
            status: 'Authentication Required'
          }
        }

        return {
          status: 'OK',
          value: auth
        }
      } catch (e) {
        log.error(e)

        return {
          status: 'Error',
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
          status: 'Authentication Required'
        }
      }

      try {
        const updatedAuth = await oauth2.updateAuthState(settings, auth)
        if (updatedAuth === 'reauthorization_required') {
          return {
            status: 'Authentication Required'
          }
        }

        return {
          status: 'OK',
          value: updatedAuth
        }
      } catch (e) {
        log.error(e)

        return {
          status: 'Error',
          error: String(e)
        }
      }
    }
  }
}
