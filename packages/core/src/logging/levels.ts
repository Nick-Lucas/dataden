import { getConfig } from 'src/config'

export const level = getConfig().LOG_LEVEL

export const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
}

if (typeof levels[getConfig().LOG_LEVEL] !== 'number') {
  throw `Log level ${
    getConfig().LOG_LEVEL
  } is unknown. Must be one of: ${Object.keys(levels).join(' ')}`
}
