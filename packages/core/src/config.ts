import * as dotenv from 'dotenv'

interface Env {
  MONGO_URI: string
  PORT: number
  LOG_LEVEL: string
}

export function validate(): Env {
  try {
    const env = dotenv.config()
    if (env.error) {
      throw env.error
    }
  } catch (error) {
    if (error) {
      if (String(error).includes('ENOENT')) {
        // ok
      } else {
        console.error('[dotenv]', error)
        throw error
      }
    }
  }

  const config = (process.env as unknown) as Env

  config.LOG_LEVEL = config.LOG_LEVEL ?? 'info'

  if (!config.PORT) {
    throw 'PORT must be provided through a .env key or environment variable'
  }

  if (!config.MONGO_URI) {
    throw 'MONGO_URI must be provided through a .env key or environment variable'
  }

  return config
}

const config = validate()

export const MONGO_URI = config.MONGO_URI
export const API_PORT = config.PORT

const LEVEL = config.LOG_LEVEL
export const LOG = {
  LEVEL
}
