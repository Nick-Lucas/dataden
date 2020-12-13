import { FilterQuery, MongoClient } from 'mongodb'

import { DATABASES, COLLECTIONS, PagingPosition, PagingResult } from './common'
import {
  DataRow,
  SyncInfo,
  Settings as ISettings,
  SyncSuccessInfo
} from '@mydata/sdk'
import { stripMongoId } from './stripMongoId'

export interface PluginBase {
  id: string
  location: string
  version: number
}

export type PluginInstallRequest = PluginBase

export interface PluginInstance {
  name: string
}

export interface Plugin extends PluginBase {
  instances: PluginInstance[]
}

type Collection = 'syncs' | 'settings' | string

export interface DbPath {
  pluginName: string
  instanceName: string
}

function getDatabaseName(info: DbPath) {
  return (info.pluginName + '__' + info.instanceName)
    .toLowerCase()
    .replace(/[^a-z0-9]/, '_')
}

function getPluginDb<T>(
  client: MongoClient,
  path: DbPath,
  collection: Collection
) {
  return client
    .db(DATABASES.PLUGIN_PREFIX + getDatabaseName(path))
    .collection<T>(collection)
}

export const Installed = {
  list: async function (client: MongoClient): Promise<Plugin[]> {
    return await client
      .db(DATABASES.CORE)
      .collection(COLLECTIONS[DATABASES.CORE].PLUGINS)
      .find<Plugin>()
      .toArray()
  },

  get: async function (client: MongoClient, pluginId: string): Promise<Plugin> {
    return await client
      .db(DATABASES.CORE)
      .collection(COLLECTIONS[DATABASES.CORE].PLUGINS)
      .findOne<Plugin>({ id: pluginId })
  },

  upsert: async function (
    client: MongoClient,
    plugin: PluginInstallRequest | Plugin
  ): Promise<Plugin> {
    const instances = (plugin as Plugin).instances ?? []

    const pluginDto: Plugin = {
      ...stripMongoId(plugin),
      instances
    }

    await client
      .db(DATABASES.CORE)
      .collection(COLLECTIONS[DATABASES.CORE].PLUGINS)
      .updateOne(
        { name: plugin.id },
        { $set: pluginDto },
        {
          upsert: true
        }
      )

    return pluginDto
  }
}

export const Data = {
  append: async function (
    client: MongoClient,
    path: DbPath,
    dataSetName: string,
    rows: DataRow[]
  ): Promise<void> {
    await getPluginDb(client, path, 'data_' + dataSetName).insertMany(rows, {
      ordered: true
    })
  },

  replace: async function (
    client: MongoClient,
    path: DbPath,
    dataSetName: string,
    rows: DataRow[]
  ): Promise<void> {
    await getPluginDb(client, path, 'data_' + dataSetName).deleteMany({})
    await Data.append(client, path, dataSetName, rows)
  },

  fetch: async function (
    client: MongoClient,
    path: DbPath,
    dataSetName: string,
    position: PagingPosition = { page: 0 },
    pageSize = 1000
  ): Promise<PagingResult<DataRow>> {
    const cursor = await getPluginDb(client, path, 'data_' + dataSetName).find<
      DataRow
    >({})

    const totalRows = await cursor.count(false)
    const pages = Math.ceil(totalRows / pageSize)
    const rows = await cursor
      .skip(pageSize * position.page)
      .limit(pageSize)
      .toArray()

    return {
      page: position.page,
      pages: pages,
      data: rows
    }
  }
}

export const Syncs = {
  last: async <T extends SyncInfo>(
    client: MongoClient,
    path: DbPath,
    query: FilterQuery<SyncInfo> = {}
  ): Promise<T | SyncSuccessInfo> => {
    const lastSync = await getPluginDb(client, path, 'syncs').findOne<T | null>(
      query,
      { sort: { $natural: -1 } }
    )

    if (lastSync) {
      return lastSync
    } else {
      return {
        success: true,
        date: new Date(0),
        latestDate: null
      }
    }
  },

  track: async (
    client: MongoClient,
    path: DbPath,
    sync: SyncInfo
  ): Promise<void> => {
    await getPluginDb(client, path, 'syncs').insertOne(sync)
  }
}

export const Settings = {
  get: async (client: MongoClient, path: DbPath): Promise<ISettings | null> => {
    const settings = await getPluginDb(
      client,
      path,
      'settings'
    ).findOne<ISettings | null>({})

    if (settings) {
      return settings
    } else {
      return null
    }
  },

  set: async (
    client: MongoClient,
    path: DbPath,
    settings: ISettings
  ): Promise<void> => {
    await getPluginDb(client, path, 'settings').updateOne(
      {},
      { $set: settings },
      { upsert: true }
    )
  }
}
