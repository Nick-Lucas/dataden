import { MongoClient } from 'mongodb'
import { getConfig } from 'src/config'

export const DATABASES = {
  CORE: 'core',
  PLUGIN_PREFIX: 'plugin__',
  DATA: 'data'
}

export const COLLECTIONS = {
  [DATABASES.CORE]: {
    PLUGINS: 'plugins',
    USERS: 'users'
  }
}

let _client = null
export async function getClient() {
  if (!_client) {
    _client = await MongoClient.connect(getConfig().MONGO_URI, {
      useUnifiedTopology: true
    })
  }

  return _client
}

export interface PagingPosition {
  page: number
}

export interface PagingResult<T> {
  page: number
  pages: number
  data: T[]
}
