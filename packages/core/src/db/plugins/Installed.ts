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
    const list = await client
      .db(DATABASES.CORE)
      .collection(COLLECTIONS[DATABASES.CORE].PLUGINS)
      .find<Plugin>()
      .toArray()

    return list.map(stripMongoId)
  },

  get: async function (client: MongoClient, pluginId: string): Promise<Plugin> {
    const plugin = await client
      .db(DATABASES.CORE)
      .collection(COLLECTIONS[DATABASES.CORE].PLUGINS)
      .findOne<Plugin>({ id: pluginId })

    return stripMongoId(plugin)
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
        { id: plugin.id },
        { $set: pluginDto },
        {
          upsert: true
        }
      )

    return stripMongoId(pluginDto)
  }
}
