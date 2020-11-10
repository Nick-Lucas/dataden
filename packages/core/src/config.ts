import * as dotenv from "dotenv";

const env = dotenv.config()

export function validate() {
  if (env.error) {
    console.error("[dotenv]", env.error)
    throw env.error
  }
}

export const MONGO_URI = process.env.MONGO_URI
