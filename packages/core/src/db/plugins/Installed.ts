import { MongoClient } from 'mongodb'
import { DATABASES, COLLECTIONS } from '../common'
import { stripMongoId } from '../stripMongoId'

interface PluginBase {
  id: string
  location: string
  version?: number
  local: boolean
}

export type PluginInstallRequest = PluginBase

export interface PluginInstance {
  name: string
}

export interface Plugin extends PluginBase {
  instances: PluginInstance[]
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
