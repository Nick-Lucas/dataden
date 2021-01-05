import { MongoClient } from 'mongodb'
import _ from 'lodash'

import { PluginAuth } from '@dataden/sdk'

import { Settings } from 'src/db/plugins'
import { PluginService } from '../types'

export type AuthResultType =
  | 'OK'
  | 'Not Configured'
  | 'Authentication Required'
  | 'Error'

export interface AuthResult<T> {
  serviceStatus: AuthResultType

  value?: T
  error?: string
}

export interface AuthFacade {
  onUserInteractionPossible?: ({
    redirectUri: string
  }) => Promise<AuthResult<string | null>>

  onUserInteractionComplete?: (
    result: Record<string, string>
  ) => Promise<AuthResult<PluginAuth.AuthState>>

  onCredentialsRequired?: () => Promise<AuthResult<PluginAuth.AuthState>>
}

export async function getSettings(
  client: MongoClient,
  plugin: PluginService
): Promise<Settings> {
  const emptySettings = Object.freeze({}) as Settings
  const defaultSettings = await plugin.definition.service.getDefaultSettings()
  const dbSettings = await Settings.get(client, {
    pluginId: plugin.definition.plugin.id,
    instanceName: plugin.instance.name
  })

  return _.merge(defaultSettings ?? emptySettings, dbSettings ?? emptySettings)
}
