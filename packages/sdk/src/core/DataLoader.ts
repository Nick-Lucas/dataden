import { SyncInfo } from './SyncInfo'
import { PluginAuth } from './PluginAuth'
import { Settings } from './PluginSettings'
import { SdkLogger } from './PluginLogger'

export interface LoaderRequest {
  lastSync: SyncInfo
  auth: PluginAuth.AuthState
}

export interface DataRow extends Record<string, any> {
  uniqueId: string
}

export interface LoaderPayload {
  mode: 'append' | 'replace'
  syncInfo: SyncInfo
  data: DataRow[]
}

//
// Plugin Definitions

export type DataLoader = {
  name: string
  load: (
    settings: Settings,
    request: LoaderRequest,
    log: SdkLogger
  ) => Promise<LoaderPayload>
}
