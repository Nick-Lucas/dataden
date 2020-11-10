import { MongoClient } from 'mongodb'
import { MONGO_URI } from 'src/config'

export async function getClient() {
  const client = await MongoClient.connect(MONGO_URI)

  return client
}
