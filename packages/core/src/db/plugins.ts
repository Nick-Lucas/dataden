import { MongoClient } from 'mongodb'
import { DATABASES, COLLECTIONS } from './common'

export interface Plugin {
  id: string
  location: string
}

function getCollecton(client: MongoClient) {
  return client
    .db(DATABASES.CORE)
    .collection(COLLECTIONS[DATABASES.CORE].PLUGINS)
}

export async function get(client: MongoClient): Promise<Plugin[]> {
  return await getCollecton(client).find<Plugin>().toArray()
}

export async function getOne(
  client: MongoClient,
  pluginId: string
): Promise<Plugin> {
  return await getCollecton(client).findOne<Plugin>({ id: pluginId })
}

export async function upsert(client: MongoClient, plugin: Plugin) {
  await getCollecton(client).updateOne(
    { name: plugin.id },
    { $set: plugin },
    {
      upsert: true
    }
  )
}
