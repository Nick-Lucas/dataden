import { Express } from 'express'
import * as Db from 'src/db'

export namespace GetSyncs {
  export const path = '/v1.0/data/syncs'

  export type ResponseItem = {
    plugin: Db.Plugins.Plugin
    pluginInstance: Db.Plugins.PluginInstance
    lastSync: Db.Plugins.Sync
  }
  export type Response = ResponseItem[]
}
