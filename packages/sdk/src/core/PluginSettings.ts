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

export interface Settings<
  PluginType = Record<SettingId, any>,
  SecretsType = Record<SettingId, string>
> {
  schedule: Schedule
  plugin: PluginType
  secrets: SecretsType
}
