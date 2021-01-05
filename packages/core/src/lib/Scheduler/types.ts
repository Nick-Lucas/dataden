import { PluginInstance } from 'src/db/plugins'
import { PluginServiceDefinition } from 'src/lib/PluginManager'

export interface PluginServiceStatus {
  running: boolean
  status: 'OK' | 'Not Started' | 'Not Configured' | 'Authentication Required'
}

export interface PluginService extends PluginServiceStatus {
  definition: PluginServiceDefinition
  instance: PluginInstance

  interval?: NodeJS.Timeout
}
