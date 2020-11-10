import * as dotenv from "dotenv";

const env = dotenv.config()

export function validate() {
  if (env.error) {
    console.error("[dotenv]", env.error)
    throw env.error
  }
}

export const MONGO_URI = process.env.MONGO_URI
export const API_PORT = process.env.PORT

const LOG_LEVEL = process.env.LOG_LEVEL
export const LOG = {
  LOG_LEVEL,
  LOG_BODY: LOG_LEVEL === 'debug'
}
