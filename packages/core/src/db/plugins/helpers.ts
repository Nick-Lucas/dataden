import { MongoClient } from 'mongodb'
import { DATABASES } from '../common'
import { DbPath, Collection } from './types'

function getDatabaseName(info: DbPath) {
  return (info.pluginId + '__' + info.instanceName)
    .toLowerCase()
    .replace(/[^a-z0-9]/, '_')
}

export function getPluginDb<T>(
  client: MongoClient,
  path: DbPath,
  collection: Collection
) {
  return client
    .db(DATABASES.PLUGIN_PREFIX + getDatabaseName(path))
    .collection<T>(collection)
}
