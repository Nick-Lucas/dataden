export interface SdkLogMethod {
  (message: string, ...meta: any[]): void
  (message: any): void
}

export interface SdkLogger {
  error: SdkLogMethod
  warn: SdkLogMethod
  info: SdkLogMethod
  debug: SdkLogMethod
}
