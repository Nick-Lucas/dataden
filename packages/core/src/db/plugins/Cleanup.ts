import { MongoClient } from 'mongodb'

import { DbPath } from './types'
import { Installed } from './Installed'
import { getPluginDb, getDataDb, getDataDbCollectionName } from './helpers'

import { getScoped } from 'src/logging'
const log = getScoped('Db:Cleanup')

export const Cleanup = {
  removePlugin: async (client: MongoClient, pluginId: string) => {
    log.info(`Will remove all data for ${pluginId}`)

    const plugin = await Installed.get(client, pluginId)
    if (!plugin) {
      log.warn(
        `Could not delete data for ${pluginId} as it has no installation entry`
      )
    }

    for (const instance of plugin.instances) {
      const instanceName = instance.name
      const dbPath: DbPath = { pluginId, instanceName }

      await _removeInstance(client, dbPath)
    }

    log.info(`Done`)
  },

  removeInstance: async (client: MongoClient, path: DbPath) => {
    log.info(`Will remove all data for ${path.pluginId}/${path.instanceName}`)

    const plugin = await Installed.get(client, path.pluginId)
    if (!plugin) {
      log.warn(
        `Could not delete data for ${path.pluginId}/${path.instanceName} as it has no installation entry`
      )
    }

    await _removeInstance(client, path)

    log.info(`Done`)
  }
}

async function _removeInstance(client: MongoClient, dbPath: DbPath) {
  // Remove the Plugin's dedicated database
  const pluginDb = getPluginDb(client, dbPath)
  await pluginDb.dropDatabase()

  // Remove the Plugin's collections in the Data database
  const dataDb = getDataDb(client)
  const collections = await dataDb.collections()
  const pluginCollectionPrefix = getDataDbCollectionName(dbPath)
  const pluginCollections = collections.filter((c) =>
    c.collectionName.startsWith(pluginCollectionPrefix)
  )
  for (const collection of pluginCollections) {
    await collection.drop()
  }

  // Remove install entry
  await Installed.remove(client, dbPath.pluginId)
}
