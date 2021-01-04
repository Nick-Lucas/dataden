import { nameIsValid } from './validation'

import { PluginAuth } from './PluginAuth'
import { Settings } from './PluginSettings'
import { SdkLogger } from './PluginLogger'

//
// Data Loader

export interface DataRow extends Record<string, any> {
  uniqueId
}

export type SyncSuccessInfo = {
  /** Outcome */
  success: true

  /** The date of the sync attempt */
  date: string

  /** the date to feed into the next sync, for instance the date of the newest record retrieved during the last sync */
  latestDate: string
}
export type SyncFailureInfo = {
  /** Outcome */
  success: false

  /** The date of the sync attempt */
  date: string

  /** Error if the outcome was a failure */
  error?: string
}
export type SyncInfo = SyncSuccessInfo | SyncFailureInfo

export interface DataRequest {
  lastSync: SyncInfo
  auth: PluginAuth.AuthState
}

export interface DataPayload {
  mode: 'append' | 'replace'
  data: DataRow[]
  lastDate: string
}

//
// Plugin Definitions

export type DataLoader = {
  name: string
  load: (
    settings: Settings,
    request: DataRequest,
    log: SdkLogger
  ) => Promise<DataPayload>
}

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
