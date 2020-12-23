import * as winston from 'winston'

export const transportConsole = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.printf(
      (info) =>
        info.timestamp +
        ' ' +
        (info.level + ': ').padEnd(7) +
        `[${info.scope ?? 'General'}${info.plugin ? `->${info.plugin}` : ''}]` +
        ` ${info.message}`
    ),
    winston.format.colorize({ all: true })
  )
})

// https://github.com/winstonjs/winston-daily-rotate-file
// TODO: allow these to be set via application or environment config.
export const transportFile = new winston.transports.DailyRotateFile({
  filename: 'application-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  frequency: '1d',
  maxFiles: '14d',
  utc: true,
  json: true
})
