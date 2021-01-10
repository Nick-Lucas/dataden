export interface SyncInfoBase {
  /** Outcome */
  success: boolean

  /** Any internal state required by the plugin when it runs */
  rehydrationData: Record<string, any>
}

export type SyncSuccessInfo = SyncInfoBase & {
  success: true
}
export type SyncFailureInfo = SyncInfoBase & {
  success: false

  /** Error information */
  error: string
}

export type SyncInfo = SyncSuccessInfo | SyncFailureInfo
