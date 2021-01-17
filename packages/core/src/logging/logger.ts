import * as winston from 'winston'
import 'winston-daily-rotate-file'

import { level, levels } from './levels'
import { SdkLogger } from '@dataden/sdk'
import { transportConsole, transportFile } from './transports'

// https://github.com/winstonjs/winston
export type Logger = winston.Logger

let _logger: Logger = null

export const getLogger = (): Logger => {
  if (!_logger) {
    _logger = winston.createLogger({
      level,
      levels,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [transportConsole, transportFile]
    })
  }

  return _logger
}

export const getScoped = (
  scope: string,
  extraContext: Record<string, string> = {}
): Logger => {
  return getLogger().child({
    scope,
    isPlugin: String(false),
    ...extraContext
  })
}

export function getPluginLogger(plugin: string): SdkLogger {
  return getScoped('PluginService', {
    plugin,
    isPlugin: String(true)
  })
}
