import { MongoClient } from 'mongodb'
import _ from 'lodash'

import * as Db from 'src/db'
import { uninstallInstance } from './uninstallPlugin'

export async function updatePlugin(
  client: MongoClient,
  pluginUpdate: Db.Plugins.Plugin
) {
  const plugin = await Db.Plugins.Installed.get(client, pluginUpdate.id)
  if (!plugin) {
    throw 'not_found' // TODO: throw proper errors to catch
  }

  const removedInstances = _.differenceBy(
    plugin.instances,
    pluginUpdate.instances,
    (instance) => instance.name
  )
  for (const instance of removedInstances) {
    await uninstallInstance(plugin.id, instance.name)
  }

  await Db.Plugins.Installed.upsert(client, pluginUpdate)
}
