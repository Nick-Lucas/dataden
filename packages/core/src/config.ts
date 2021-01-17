import fs from 'fs'
import os from 'os'
import path from 'path'
import * as dotenv from 'dotenv'
import _ from 'lodash'

//
// Apply build-time environment

const envDev = 'development'
const envProd = 'production'
const envs = [envDev, envProd]

process.env['NODE_ENV'] = process.env.NODE_ENV
if (!envs.includes(process.env['NODE_ENV'])) {
  process.env['NODE_ENV'] = envDev
}
const isProduction = process.env['NODE_ENV'] === envProd

//
// Load and merge configurations

interface Config {
  IS_PRODUCTION: boolean
  MONGO_URI: string
  PORT: number | string
  LOG_LEVEL: string
}

function loadDefaults(): Partial<Config> {
  return {
    IS_PRODUCTION: isProduction,
    LOG_LEVEL: 'info'
  }
}

function loadUserConfig(): Partial<Config> {
  if (!isProduction) {
    // We only load machine-wide configs in production mode
    return {}
  }

  const homeDir = os.homedir()
  const configPaths = [path.join(homeDir, '.dataden.json')]

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath).toString()) as Partial<
        Config
      >
    }
  }
}

function loadBaseEnvironment(): Partial<Config> {
  // Although we use dotenv, in production .env may not be provided
  //  and dotenv doesn't fall back on the existing environment when it fails
  return {
    LOG_LEVEL: process.env.LOG_LEVEL || undefined,
    PORT: process.env.PORT || undefined,
    MONGO_URI: process.env.MONGO_URI || undefined
  }
}

function loadDotEnv(): Partial<Config> {
  try {
    const env = dotenv.config()
    if (env.error) {
      throw env.error
    }

    return (env.parsed as unknown) as Config
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
}

function loadAndMergeConfigs(): Config {
  const config = _.merge(
    loadDefaults(),
    loadUserConfig(),
    loadBaseEnvironment(),
    loadDotEnv()
  )

  if (!config.PORT) {
    throw 'PORT must be provided through a .env key or environment variable'
  }

  if (!config.MONGO_URI) {
    throw 'MONGO_URI must be provided through a .env key or environment variable'
  }

  return config as Config
}

let config: Config = null
if (!config) {
  config = loadAndMergeConfigs()
}

export const getConfig = (): Config => {
  if (!config) {
    config = loadAndMergeConfigs()
  }
  return config
}
