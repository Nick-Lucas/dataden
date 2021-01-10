import { nameIsValid } from './validation'

import { PluginAuth } from './PluginAuth'
import { Settings } from './PluginSettings'
import { DataLoader } from './DataLoader'

export interface PluginService {
  //
  // Configuration

  /** Used when initialising the plugin for the first time. Provide sensible (or no) defaults for plugin settings */
  getDefaultSettings?: () => Promise<Settings>

  /** Auth method definition, used to manage authorization of the plugin with 3rd parties, for instance an OAuth2 API which requires user interaction */
  authMethod?: PluginAuth.AuthMethod

  //
  // Data

  /** Must be implemented! Given configuration, return any new state which should be stored */
  loaders: DataLoader[]
}

type PluginServiceRequest = Omit<PluginService, 'loaders'> & {
  loaders: DataLoader | DataLoader[]
}

//
// Errors

export class NotImplementedError extends Error {}
export class PluginValidationError extends Error {}
export class DataLoaderValidationError extends Error {}

//
// Constructors

export function createPlugin({
  getDefaultSettings = null,
  authMethod = { type: 'none' },
  loaders = null
}: PluginServiceRequest): PluginService {
  if (!getDefaultSettings) {
    throw new PluginValidationError('getDefaultSettings must be defined')
  }

  if (!loaders || (Array.isArray(loaders) && !loaders.length)) {
    throw new DataLoaderValidationError('DataLoader was not provided')
  }
  if (!Array.isArray(loaders)) {
    loaders = [loaders]
  }

  for (const loader of loaders) {
    if (!nameIsValid(loader.name)) {
      throw new DataLoaderValidationError(
        `DataLoader name is invalid, must be a-z 0-9 _ but received: ${loader.name}`
      )
    }
  }

  return {
    getDefaultSettings,
    authMethod,
    loaders
  }
}
