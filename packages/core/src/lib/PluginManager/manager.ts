import fs from 'fs'
import axios, { AxiosResponse } from 'axios'

import {
  LocalPlugin,
  PluginServiceDefinition,
  Registry,
  RegistryPlugin
} from './types'

import * as Db from 'src/db'

import { PluginService, pluginInstanceIsValid } from '@dataden/sdk'
import { getInstallationManager } from './getInstallationManager'

import { getScoped } from 'src/logging'
import { UpgradeInfo } from '../PluginInstallationManager'
const log = getScoped('PluginManager')

const REGISTRY_URI =
  'https://raw.githubusercontent.com/Nick-Lucas/dataden/master/meta/registry.json'

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
  onSuccess: () => Promise<void>
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

export function uninstallPlugin() {
  throw '[uninstallPlugin] Not Implemented'
}

export async function loadPluginServiceDefinitions(): Promise<
  PluginServiceDefinition[]
> {
  const client = await Db.getClient()
  const plugins = await Db.Plugins.Installed.list(client)

  log.info(`${plugins?.length ?? 0} Plugins will be loaded`)

  const definitions: PluginServiceDefinition[] = []
  for (const plugin of plugins) {
    const definition = await loadPluginServiceDefinition(plugin)
    if (!definition) {
      continue
    }

    definitions.push(definition)
  }

  return definitions
}

export async function loadPluginServiceDefinitionById(
  pluginId: string
): Promise<PluginServiceDefinition | null> {
  const client = await Db.getClient()
  const plugin = await Db.Plugins.Installed.get(client, pluginId)
  if (!plugin) {
    return null
  }

  return loadPluginServiceDefinition(plugin)
}

async function loadPluginServiceDefinition(
  plugin: Db.Plugins.Plugin
): Promise<PluginServiceDefinition | null> {
  if (!plugin.location) {
    log.warn(`😒 Plugin ${plugin.id} as location is not provided.`)
    return null
  }

  const exists = fs.existsSync(plugin.location)
  if (!exists) {
    log.warn(
      `😒 Plugin ${plugin.id} at location ${plugin.location} has disappeared. Please re-install.`
    )
    return null
  }

  const service = (await require(plugin.location)) as PluginService
  if (!pluginInstanceIsValid(service)) {
    log.error(
      `❗️ Bad PluginInstance definition for ${plugin.id} at ${plugin.location}.`
    )
    return null
  }

  log.info(
    `😃 Loaded Plugin ${plugin.id} with ${service.loaders.length} loaders`
  )

  return {
    plugin,
    service
  }
}

export async function getRegistry(): Promise<AxiosResponse<Registry>> {
  return await axios.get<Registry>(REGISTRY_URI, {
    validateStatus: (status) => status === 200
  })
}
