import { MongoClient } from 'mongodb'
import { getConfig } from 'src/config'

export async function getClient() {
  const client = await MongoClient.connect(getConfig().MONGO_URI, {
    useUnifiedTopology: true
  })

  // Wipe database before tests start
  const allDbs = await client.db('').admin().listDatabases()
  const allDbNames = allDbs.databases
    .map((db) => db.name)
    .filter((dbName) => !['admin', 'local', 'config'].includes(dbName))
  for (const dbName of allDbNames) {
    await client.db(dbName).dropDatabase()
  }

  return client
}

export const getClientMocked = true
