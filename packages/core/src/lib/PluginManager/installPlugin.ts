import * as Db from 'src/db'

import { LocalPlugin, RegistryPlugin } from './types'
import { getInstallationManager } from 'src/lib/PluginManager/getInstallationManager'

import { getScoped } from 'src/logging'
const log = getScoped('PluginManager')

export class PluginConflictError extends Error {
  constructor() {
    super('Plugin is already installed')
  }
}

export class InstallPluginError extends Error {}

export async function installPlugin(
  registryPlugin: RegistryPlugin | LocalPlugin
): Promise<Db.Plugins.Plugin> {
  log.info(`Will attempt install of plugin ${registryPlugin.id}`)

  if (!registryPlugin.source) {
    log.warn(`Source not defined for plugin ${registryPlugin.id}`)
    throw new InstallPluginError('Plugin source not provided')
  }

  const client = await Db.getClient()

  const installedPlugin = await Db.Plugins.Installed.get(
    client,
    registryPlugin.id
  )
  if (installedPlugin) {
    log.warn(
      `Plugin was already installed \n${JSON.stringify(
        installedPlugin,
        null,
        2
      )}`
    )
    throw new PluginConflictError()
  }

  const installationManager = getInstallationManager(
    registryPlugin.local,
    registryPlugin.source
  )

  await installationManager.install({ forceUpdate: true })

  const plugin: Db.Plugins.Plugin = {
    id: registryPlugin.id,
    location: installationManager.getInstalledPath(),
    version: installationManager.getInstalledVersion(),
    instances: [
      {
        name: 'default'
      }
    ],
    local: registryPlugin.local ?? false,
    source: registryPlugin.source
  }

  await Db.Plugins.Installed.upsert(client, plugin)

  return plugin
}
