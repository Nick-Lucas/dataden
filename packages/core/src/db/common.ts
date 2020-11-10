import { MongoClient } from 'mongodb'
import { MONGO_URI } from 'src/config'

export const DATABASES = {
  CORE: 'app_core',
  PLUGIN_PREFIX: 'app_plugin_'
}

export const COLLECTIONS = {
  [DATABASES.CORE]: {
    PLUGINS: 'plugins'
  }
}

export async function getClient() {
  const client = await MongoClient.connect(MONGO_URI, {
    useUnifiedTopology: true
  })

  return client
}
