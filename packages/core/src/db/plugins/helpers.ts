import { MongoClient } from 'mongodb'
import { DATABASES } from '../common'
import { DbPath, Collection } from './types'

function getPluginId(info: DbPath) {
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
    .db(DATABASES.PLUGIN_PREFIX + getPluginId(path))
    .collection<T>(collection)
}

export function getPluginDataDb<T>(
  client: MongoClient,
  path: DbPath,
  dataSetName: string
) {
  return client
    .db(DATABASES.DATA)
    .collection<T>(getPluginId(path) + '__' + dataSetName)
}
