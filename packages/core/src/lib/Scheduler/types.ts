import { PluginInstance } from 'src/db/plugins'
import { PluginServiceDefinition } from 'src/lib/PluginManager'

export type PluginServiceStatusType =
  | 'OK'
  | 'Not Started'
  | 'Not Configured'
  | 'Authentication Required'
  | 'Error'

export interface PluginServiceStatus {
  running: boolean
  status: PluginServiceStatusType
}

export interface PluginLoaderScheduler {
  interval?: NodeJS.Timeout
  immediate: () => Promise<void>
}

export interface PluginService extends PluginServiceStatus {
  definition: PluginServiceDefinition
  instance: PluginInstance

  loaderScheduler?: PluginLoaderScheduler
}
