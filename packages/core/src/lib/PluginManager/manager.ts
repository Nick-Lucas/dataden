import fs from 'fs'
import path from 'path'
import axios from 'axios'

import {
  LocalPlugin,
  PluginDefinition,
  Registry,
  RegistryPlugin
} from './types'

import * as Db from 'src/db'

import { PluginInstance, pluginInstanceIsValid } from '@mydata/sdk'

const REGISTRY_URI =
  'https://raw.githubusercontent.com/Nick-Lucas/mydata/master/meta/registry.json'

// TODO: this will be next to the bundle which may not be ideal during upgrades, perhaps best to select a stable directory elsewhere
const pluginDir = path.join(__dirname, 'installed')
if (!fs.existsSync(pluginDir)) {
  fs.mkdirSync(pluginDir)
}

export async function installPlugin(
  plugin: RegistryPlugin | LocalPlugin
): Promise<Db.Plugins.Plugin> {
  if (!plugin.source) {
    console.warn(`Source not defined for plugin ${plugin.id}`)
    return
  }

  const installedPlugin: Db.Plugins.Plugin = {
    id: plugin.id,
    location: plugin.source
  }

  const client = await Db.getClient()
  if (plugin.local) {
    if (!fs.existsSync(plugin.source)) {
      throw `[installPlugin] Local Plugin ${plugin.id} Cannot Be Installed. Does not exist.`
    }

    await Db.Plugins.Installed.upsert(client, installedPlugin)
  } else {
    throw '[installPlugin] Remote Plugin Install: Not Implemented'
    // TODO: download to directory
    // TODO: register local location
  }

  return installedPlugin
}

export function uninstallPlugin(pluginId: string) {
  throw '[uninstallPlugin] Not Implemented'
}

export async function loadPlugins(): Promise<PluginDefinition[]> {
  const client = await Db.getClient()
  const plugins = await Db.Plugins.Installed.list(client)

  console.log(`[loadPlugins] ${plugins?.length ?? 0} Plugins will be loaded`)

  const definitions: PluginDefinition[] = []
  for (const plugin of plugins) {
    const instance = await loadPlugin(plugin)
    if (!instance) {
      continue
    }

    definitions.push({
      id: plugin.id,
      ...instance
    })
  }

  return definitions
}

export async function loadPluginById(
  pluginId: string
): Promise<PluginInstance | null> {
  const client = await Db.getClient()
  const plugin = await Db.Plugins.Installed.get(client, pluginId)
  if (!plugin) {
    return null
  }

  return loadPlugin(plugin)
}

async function loadPlugin(
  plugin: Db.Plugins.Plugin
): Promise<PluginInstance | null> {
  if (!plugin.location) {
    console.warn(
      `[loadPlugins] 😒 Plugin ${plugin.id} as location is not provided.`
    )
    return null
  }

  const exists = fs.existsSync(plugin.location)
  if (!exists) {
    console.warn(
      `[loadPlugins] 😒 Plugin ${plugin.id} at location ${plugin.location} has disappeared. Please re-install.`
    )
    return null
  }

  const instance = (await require(plugin.location)) as PluginInstance
  if (!pluginInstanceIsValid(instance)) {
    console.error(
      `[loadPlugins] ❗️ Bad PluginInstance definition for ${plugin.id} at ${plugin.location}.`
    )
    return null
  }

  console.log(
    `[loadPlugins] 😃 Loaded Plugin ${plugin.id} with ${instance.loaders.length} loaders`
  )

  return instance
}

export async function getRegistry() {
  return await axios.get<Registry>(REGISTRY_URI, {
    validateStatus: (status) => status === 200
  })
}
