import { MongoClient } from 'mongodb'
import * as uuid from 'uuid'
import { DATABASES, COLLECTIONS, PagingPosition, PagingResult } from './common'

import { DataRow, SyncInfo, Settings as ISettings } from '@mydata/sdk'

export interface PluginBase {
  id: string
  location: string
  version: number
}

export type PluginInstallRequest = PluginBase

export interface PluginInstance {
  uuid?: string
  name: string
}

export interface Plugin extends PluginBase {
  instances: PluginInstance[]
}

type Collection = 'syncs' | 'settings' | string

function getDatabaseName(instance: PluginInstance) {
  return instance.name.toLowerCase().replace(/[^a-z0-9]/, '_')
}

function getPluginDb(
  client: MongoClient,
  instance: PluginInstance,
  collection: Collection
) {
  return client
    .db(DATABASES.PLUGIN_PREFIX + getDatabaseName(instance))
    .collection(collection)
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
    for (const instance of instances) {
      if (!uuid.validate(instance.uuid)) {
        instance.uuid = uuid.v4()
      }
    }

    const pluginDto: Plugin = {
      ...plugin,
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
    instance: PluginInstance,
    dataSetName: string,
    rows: DataRow[]
  ): Promise<void> {
    await getPluginDb(client, instance, 'data_' + dataSetName).insertMany(
      rows,
      {
        ordered: true
      }
    )
  },

  replace: async function (
    client: MongoClient,
    instance: PluginInstance,
    dataSetName: string,
    rows: DataRow[]
  ): Promise<void> {
    await getPluginDb(client, instance, 'data_' + dataSetName).deleteMany({})
    await Data.append(client, instance, dataSetName, rows)
  },

  fetch: async function (
    client: MongoClient,
    instance: PluginInstance,
    dataSetName: string,
    position: PagingPosition = { page: 0 },
    pageSize = 1000
  ): Promise<PagingResult<DataRow>> {
    const cursor = await getPluginDb(
      client,
      instance,
      'data_' + dataSetName
    ).find<DataRow>({})

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
    instance: PluginInstance
  ): Promise<SyncInfo> => {
    const lastSync = await getPluginDb(
      client,
      instance,
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
    instance: PluginInstance,
    sync: SyncInfo
  ): Promise<void> => {
    await getPluginDb(client, instance, 'syncs').insertOne(sync)
  }
}

export const Settings = {
  get: async (
    client: MongoClient,
    instance: PluginInstance
  ): Promise<ISettings | null> => {
    const settings = await getPluginDb(
      client,
      instance,
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
    instance: PluginInstance,
    settings: ISettings
  ): Promise<void> => {
    await getPluginDb(client, instance, 'settings').updateOne(
      {},
      { $set: settings },
      { upsert: true }
    )
  }
}
