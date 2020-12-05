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
  name: string // TODO: use name for database, and when it changes also migrate the database
  schedule: Schedule
  plugin: Record<SettingId, any>
}

// TODO: consume this in a frontend
export interface SettingDefinition {
  id: SettingId
  name: string
  description?: string
  type: 'string' | 'number' | 'select'
  select?: string[]
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

export interface Initable {
  /** You may initialise any plugin state here. */
  init?: () => Promise<void>
}

export type DataLoader = {
  name: string
  load: (settings: Settings, request: DataRequest) => Promise<DataPayload>
}

export interface PluginInstance {
  //
  // Configuration

  /** Used when initilising the plugin for the first time. Provide sensible (or no) defaults for plugin settings */
  getDefaultSettings?: () => Promise<Settings>

  /** Return configuration which can be used to populate a UI with controls or validate plugin settings */
  getCustomSettingsDefinition?: () => Promise<SettingDefinition[]>

  //
  // Data

  /** Must be implemented! Given configuration, return any new state which should be stored */
  loaders: DataLoader[]
}

type PluginInstanceRequest = Omit<PluginInstance, 'loaders'> & {
  loaders: DataLoader | DataLoader[]
} & Initable

//
// Errors

export class NotImplementedError extends Error {}
export class PluginValidationError extends Error {}
export class DataLoaderValidationError extends Error {}

//
// Constructors

export function createPlugin({
  init = null,
  getDefaultSettings = null,
  getCustomSettingsDefinition = null,
  loaders = null
}: PluginInstanceRequest): PluginInstance {
  if (!getDefaultSettings) {
    throw new PluginValidationError('getDefaultSettings must be defined')
  }

  if (!loaders || (Array.isArray(loaders) && !loaders.length)) {
    throw new DataLoaderValidationError('DataLoader was not provided')
  }
  if (!Array.isArray(loaders)) {
    loaders = [loaders]
  }

  // TODO: verify data loader names are alpha-numeric and _
  // throw new DataLoaderValidationError("Loader ${loader.name} is not valid, can only contain: a-z 0-9 _")

  init?.()

  return {
    getDefaultSettings,
    getCustomSettingsDefinition,
    loaders
  }
}
