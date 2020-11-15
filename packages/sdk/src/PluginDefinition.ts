export interface DataRow extends Record<string, unknown> {
  uniqueId
}

export interface DataRequest {
  lastDate: Date
  settings: Record<string, string>
}

export interface DataPayload {
  mode: 'append' | 'replace'
  data: DataRow[]
  lastDate: Date
}

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

type SettingId = string

export interface Settings {
  schedule: Schedule
  plugin: Record<SettingId, any>
}

export interface SettingDefinition {
  id: SettingId
  name: string
  description?: string
  type: 'string' | 'number' | 'select'
  select?: string[]
}

export interface Initable {
  /** You may initialise any plugin state here. */
  init: () => Promise<void>
}

export interface PluginDefinition {
  //
  // Configuration

  /** Used when initilising the plugin for the first time. Provide sensible (or no) defaults for plugin settings */
  getDefaultSettings: () => Promise<Settings>

  /** Return configuration which can be used to populate a UI with controls or validate plugin settings */
  getCustomSettingsDefinition: () => Promise<SettingDefinition[]>

  //
  // Data

  /** Must be implemented! Given configuration, return any new state which should be stored */
  loadData: (settings: Settings, request: DataRequest) => Promise<DataPayload>
}

export class NotImplementedError extends Error {}

export async function createPlugin({
  getDefaultSettings = async () => ({
    schedule: {
      every: 1,
      grain: 'day'
    },
    plugin: {}
  }),

  getCustomSettingsDefinition = async () => [],

  init = async () => await Promise.resolve(),

  loadData = async () => {
    throw new NotImplementedError('loadData')
  }
}: PluginDefinition & Initable): Promise<PluginDefinition> {
  await init()

  return {
    getCustomSettingsDefinition,
    getDefaultSettings,
    loadData
  }
}
