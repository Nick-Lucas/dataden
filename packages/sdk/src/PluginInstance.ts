import { nameIsValid } from './validation'

export interface Schedule {
  every: number
  grain:
    | 'minutes'
    | 'minute'
    | 'hours'
    | 'hour'
    | 'days'
    | 'day'
    | 'weeks'
    | 'week'
}

//
// Settings

export type SettingId = string

export interface Settings {
  schedule: Schedule
  plugin: Record<SettingId, any>
}

//
// Data Loader

export interface DataRow extends Record<string, any> {
  uniqueId
}

export interface SyncInfo {
  date: Date
}

export interface DataRequest {
  lastSync: SyncInfo
}

export interface DataPayload {
  mode: 'append' | 'replace'
  data: DataRow[]
  lastDate: Date
}

//
// Plugin Definitions

export type DataLoader = {
  name: string
  load: (settings: Settings, request: DataRequest) => Promise<DataPayload>
}

export interface PluginService {
  name: string

  //
  // Configuration

  /** Used when initilising the plugin for the first time. Provide sensible (or no) defaults for plugin settings */
  getDefaultSettings?: () => Promise<Settings>

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
  name = null,
  getDefaultSettings = null,
  loaders = null
}: PluginServiceRequest): PluginService {
  if (!nameIsValid(name)) {
    throw new PluginValidationError(
      `Plugin name is invalid, must be a-z 0-9 _ but received: ${name}`
    )
  }

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
    name,
    getDefaultSettings,
    loaders
  }
}
