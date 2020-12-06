import { MongoClient } from 'mongodb'
import { MONGO_URI } from 'src/config'

export const DATABASES = {
  CORE: 'core',
  PLUGIN_PREFIX: 'plugin__'
}

export const COLLECTIONS = {
  [DATABASES.CORE]: {
    PLUGINS: 'plugins'
  }
}

let _client = null
export async function getClient() {
  if (!_client) {
    _client = await MongoClient.connect(MONGO_URI, {
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
