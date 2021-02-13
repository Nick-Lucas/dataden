import { MongoClient } from 'mongodb'
import { DATABASES } from '../common'
import { DbPath, Collection } from './types'

const sanitise = (str: string) => str.toLowerCase().replace(/[^a-z0-9]+/g, '_')

export function _getPluginId(info: DbPath) {
  return sanitise(info.pluginId) + '__' + sanitise(info.instanceName)
}

export function getPluginDb(client: MongoClient, path: DbPath) {
  return client.db(DATABASES.PLUGIN_PREFIX + _getPluginId(path))
}

export function getPluginDbCollection<T>(
  client: MongoClient,
  path: DbPath,
  collection: Collection
) {
  return getPluginDb(client, path).collection<T>(collection)
}

export function getDataDb(client: MongoClient) {
  return client.db(DATABASES.DATA)
}

export function getDataDbCollectionName(path: DbPath, dataSetName = '') {
  return _getPluginId(path) + '__' + sanitise(dataSetName)
}

export function getDataDbAggregationName(aggregationName = '') {
  return 'aggregation__' + sanitise(aggregationName)
}

export function getDataDbCollection<T>(
  client: MongoClient,
  path: DbPath,
  dataSetName: string
) {
  return getDataDb(client).collection<T>(
    getDataDbCollectionName(path, dataSetName)
  )
}

export function getDataDbAggregation<T>(
  client: MongoClient,
  aggregationName: string
) {
  return getDataDb(client).collection<T>(
    getDataDbAggregationName(aggregationName)
  )
}
