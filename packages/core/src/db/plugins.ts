import { FilterQuery, MongoClient } from 'mongodb'

import { DATABASES, COLLECTIONS, PagingPosition, PagingResult } from './common'
import * as Sdk from '@mydata/sdk'
import { stripMongoId } from './stripMongoId'

// DTOS

interface PluginBase {
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

export type DataRow = Sdk.DataRow

export type Sync = Sdk.SyncInfo

export type Settings = Sdk.Settings

// Db layer

type Collection = 'syncs' | 'settings' | string

export interface DbPath {
  pluginServiceName: string
  instanceName: string
}

function getDatabaseName(info: DbPath) {
  return (info.pluginServiceName + '__' + info.instanceName)
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

// Access

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
  last: async (
    client: MongoClient,
    path: DbPath,
    query: FilterQuery<Sync> = {}
  ): Promise<Sync> => {
    const lastSync = await getPluginDb(
      client,
      path,
      'syncs'
    ).findOne<Sync | null>(query, { sort: { date: -1 } })

    if (lastSync) {
      return lastSync
    } else {
      return {
        success: true,
        date: null,
        latestDate: null
      }
    }
  },

  track: async (
    client: MongoClient,
    path: DbPath,
    sync: Sync
  ): Promise<void> => {
    await getPluginDb(client, path, 'syncs').insertOne(sync)
  }
}

export const Settings = {
  get: async (client: MongoClient, path: DbPath): Promise<Settings | null> => {
    const settings = await getPluginDb(
      client,
      path,
      'settings'
    ).findOne<Settings | null>({})

    if (settings) {
      return settings
    } else {
      return null
    }
  },

  set: async (
    client: MongoClient,
    path: DbPath,
    settings: Settings
  ): Promise<void> => {
    await getPluginDb(client, path, 'settings').updateOne(
      {},
      { $set: stripMongoId(settings) },
      { upsert: true }
    )
  }
}
