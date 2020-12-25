import * as Db from 'src/db'
import { Scheduler } from 'src/lib/Scheduler'

export namespace GetStatus {
  export const path = '/v1.0/status'

  export type ResponseItem = {
    plugin: Db.Plugins.Plugin
    pluginInstance: Db.Plugins.PluginInstance
    lastSync: Db.Plugins.Sync
    status: Scheduler.PluginServiceStatus
  }
  export type Response = ResponseItem[]
}
