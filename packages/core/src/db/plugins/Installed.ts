import { MongoClient } from 'mongodb'
import { DATABASES, COLLECTIONS } from '../common'
import { stripMongoId } from '../stripMongoId'

interface PluginBase {
  /** Unique ID for plugin */
  id: string

  /** Location of the installed plugin, where to load it from */
  location: string

  /** Version number from the plugin's package.json */
  version: string

  /** Whether the plugin is installed from a local or remote location */
  local: boolean

  /** The original source of the plugin, might be a registry name, or a filesystem path */
  source: string
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
