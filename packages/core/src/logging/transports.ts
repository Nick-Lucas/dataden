import * as winston from 'winston'
import { getConfig } from 'src/config'

export const transportConsole = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.printf(
      (info) =>
        info.timestamp +
        ' ' +
        `[${info.scope ?? 'General'}${info.plugin ? `->${info.plugin}` : ''}]` +
        ` ${info.message}` +
        (info.stack ? '\n' + info.stack : '')
    ),
    winston.format.colorize({ all: true })
  )
})

// https://github.com/winstonjs/winston-daily-rotate-file
export const transportFile = new winston.transports.DailyRotateFile({
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  frequency: '1d',
  maxFiles: '14d',
  utc: true,
  json: true,
  dirname: getConfig().LOG_DIR
})
