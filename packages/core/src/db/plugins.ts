import { MongoClient } from 'mongodb'
import { DATABASES, COLLECTIONS, PagingPosition, PagingResult } from './common'

import { DataRow, SyncInfo } from '@mydata/sdk'

export interface Plugin {
  id: string
  location: string
}

type Collection = 'syncs' | 'data'

function db(client: MongoClient, pluginId: string, collection: Collection) {
  return client
    .db(DATABASES.CORE)
    .collection(DATABASES.PLUGIN_PREFIX + collection)
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

  upsert: async function (client: MongoClient, plugin: Plugin) {
    await client
      .db(DATABASES.CORE)
      .collection(COLLECTIONS[DATABASES.CORE].PLUGINS)
      .updateOne(
        { name: plugin.id },
        { $set: plugin },
        {
          upsert: true
        }
      )
  }
}

// TODO: should wrap writes up in a transaction on the outside outside

export const Data = {
  append: async function (
    client: MongoClient,
    pluginId: string,
    rows: DataRow[]
  ): Promise<void> {
    await db(client, pluginId, 'data').insertMany(rows, {
      ordered: true
    })
  },

  replace: async function (
    client: MongoClient,
    pluginId: string,
    rows: DataRow[]
  ): Promise<void> {
    await db(client, pluginId, 'data').deleteMany({})
    await Data.append(client, pluginId, rows)
  },

  fetch: async function (
    client: MongoClient,
    pluginId: string,
    position: PagingPosition = { page: 0 },
    pageSize = 1000
  ): Promise<PagingResult<DataRow>> {
    const cursor = await db(client, pluginId, 'data').find<DataRow>({})

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
  get: async (client: MongoClient, pluginId: string): Promise<SyncInfo> => {
    const lastSync = await db(
      client,
      pluginId,
      'syncs'
    ).findOne<SyncInfo | null>({}, { sort: { $natural: -1 } })

    if (lastSync) {
      return lastSync
    } else {
      return {
        date: new Date(0)
      }
    }
  },

  track: async (
    client: MongoClient,
    pluginId: string,
    sync: SyncInfo
  ): Promise<void> => {
    await db(client, pluginId, 'syncs').insertOne(sync)
  }
}
