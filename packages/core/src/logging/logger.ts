import * as winston from 'winston'
import 'winston-daily-rotate-file'

import { LOG } from 'src/config'
import { SdkLogger } from '@mydata/sdk'

export const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

if (typeof levels[LOG.LEVEL] !== 'number') {
  throw `Log level ${LOG.LEVEL} is unknown. Must be one of: ${Object.keys(
    levels
  ).join(' ')}`
}

// https://github.com/winstonjs/winston
const logger = winston.createLogger({
  level: LOG.LEVEL,
  levels,

  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),

        winston.format.printf(
          (info) =>
            info.timestamp +
            ' ' +
            (info.level + ': ').padEnd(7) +
            `[${info.scope ?? 'General'}${
              info.plugin ? `->${info.plugin}` : ''
            }]` +
            ` ${info.message}`
        ),
        winston.format.colorize({ all: true })
      )
    }),

    // https://github.com/winstonjs/winston-daily-rotate-file
    // TODO: allow these to be set via application or environment config.
    new winston.transports.DailyRotateFile({
      filename: 'application-%DATE%.log',
      datePattern: 'YYYY-MM-DD-HH',
      zippedArchive: true,
      frequency: '1d',
      maxFiles: '14d',
      utc: true,
      json: true
    })
  ]
})

export type Logger = winston.Logger

export const getLogger = (): Logger => logger

export const getScoped = (
  scope: string,
  extraContext: Record<string, string> = {}
): Logger => {
  return logger.child({
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
