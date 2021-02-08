import { MongoClient } from 'mongodb'
import { getConfig } from 'src/config'

let _client: MongoClient
export async function getClient() {
  if (_client && !_client.isConnected()) {
    _client = null
  }
  if (!_client) {
    _client = await MongoClient.connect(getConfig().MONGO_URI, {
      useUnifiedTopology: true
    })
  }

  return _client
}

export async function wipeDb() {
  const client = await getClient()

  const allDbs = await client.db('').admin().listDatabases()
  const allDbNames = allDbs.databases
    .map((db) => db.name)
    .filter((dbName) => !['admin', 'local', 'config'].includes(dbName))

  for (const dbName of allDbNames) {
    await client.db(dbName).dropDatabase()
  }

  await new Promise((resolve) => setTimeout(resolve, 10))
}

export const getClientMocked = true
