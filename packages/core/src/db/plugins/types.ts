export type Collection = 'syncs' | 'settings' | 'auth' | string

export interface DbPath {
  pluginId: string
  instanceName: string
}
