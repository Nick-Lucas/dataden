import * as winston from 'winston'
import 'winston-daily-rotate-file'

import { LOG } from 'src/config'
import { SdkLogger } from '@dataden/sdk'
import { transportConsole, transportFile } from './transports'

export const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

// https://github.com/winstonjs/winston
export type Logger = winston.Logger

let _logger: Logger = null

export const getLogger = (): Logger => {
  if (!_logger) {
    if (typeof levels[LOG.LEVEL] !== 'number') {
      throw `Log level ${LOG.LEVEL} is unknown. Must be one of: ${Object.keys(
        levels
      ).join(' ')}`
    }

    _logger = winston.createLogger({
      level: LOG.LEVEL,
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
