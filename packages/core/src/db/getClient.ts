import { MongoClient } from 'mongodb'
import { getConfig } from 'src/config'

let _client = null
export async function getClient() {
  if (!_client) {
    _client = await MongoClient.connect(getConfig().MONGO_URI, {
      useUnifiedTopology: true
    })
  }

  return _client
}

export const getClientMocked = false
