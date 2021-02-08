import * as Db from 'src/db'
import { UpgradeInfo } from 'src/lib/PluginInstallationManager'

import { getInstallationManager } from './getInstallationManager'

import { getScoped } from 'src/logging'
const log = getScoped('PluginManager')

export async function getUpgradeInfo(pluginId: string): Promise<UpgradeInfo> {
  const client = await Db.getClient()

  const plugin = await Db.Plugins.Installed.get(client, pluginId)
  if (!plugin) {
    return null
  }

  return await getInstallationManager(
    plugin.local,
    plugin.source
  ).getUpgradeInfo()
}

interface UpgradeOptions {
  /** Should the returned promise capture the install process and run it in-line, or just validation checks? */
  inline: boolean

  /** Called on a successful installation */
  onSuccess?: () => Promise<void>
}
export async function upgradePlugin(
  pluginId: string,
  { inline = false, onSuccess }: UpgradeOptions
): Promise<boolean> {
  const client = await Db.getClient()

  const plugin = await Db.Plugins.Installed.get(client, pluginId)
  if (!plugin) {
    return false
  }

  const installationManager = getInstallationManager(
    plugin.local,
    plugin.source
  )

  const upgradeInfo = await installationManager.getUpgradeInfo()
  if (!upgradeInfo.updatable) {
    return false
  }

  async function doUpdate() {
    try {
      await installationManager.install({ forceUpdate: true })
    } catch (e) {
      log.error(`Plugin upgrade failed`)
      log.error(e)
      return
    }

    // TODO: maybe move this data out of the database and just load it from disk on demand?
    const version = installationManager.getInstalledVersion()
    await Db.Plugins.Installed.upsert(client, {
      ...plugin,
      version
    })

    await onSuccess?.()
  }

  const installPromise = doUpdate()
  if (inline) {
    await installPromise
  }

  return true
}
