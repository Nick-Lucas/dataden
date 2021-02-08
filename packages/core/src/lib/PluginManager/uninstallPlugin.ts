import * as Db from 'src/db'

import { getScoped } from 'src/logging'
const log = getScoped('PluginManager:Uninstall')

export async function uninstallPlugin(pluginId: string) {
  log.info(`Attempting to uninstall plugin ${pluginId}`)
  const client = await Db.getClient()

  const plugin = await Db.Plugins.Installed.get(client, pluginId)
  if (!plugin) {
    return
  }

  // TODO: delete installed files

  await Db.Plugins.Cleanup.removePlugin(client, pluginId)
}

export async function uninstallInstance(
  pluginId: string,
  instanceName: string
) {
  log.info(`Attempting to uninstall plugin ${pluginId}`)
  const client = await Db.getClient()

  const plugin = await Db.Plugins.Installed.get(client, pluginId)
  if (!plugin) {
    return
  }

  await Db.Plugins.Cleanup.removeInstance(client, { pluginId, instanceName })
}
