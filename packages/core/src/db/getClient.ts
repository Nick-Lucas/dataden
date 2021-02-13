import { MongoClient } from 'mongodb'
import { getConfig } from 'src/config'

let _client: MongoClient = null
export async function getClient(): Promise<MongoClient> {
  if (!_client) {
    _client = await MongoClient.connect(getConfig().MONGO_URI, {
      useUnifiedTopology: true
    })
  }

  return _client
}

export const getClientMocked = false
