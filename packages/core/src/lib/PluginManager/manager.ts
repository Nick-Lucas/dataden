import fs from 'fs'
import path from 'path'
import axios from 'axios'

import {
  LocalPlugin,
  PluginDefinition,
  Registry,
  RegistryPlugin
} from './types'

import { getClient, Plugins } from 'src/db'

import { PluginInstance } from '@mydata/sdk'

const REGISTRY_URI =
  'https://raw.githubusercontent.com/Nick-Lucas/mydata/master/meta/registry.json'

// TODO: this will be next to the bundle which may not be ideal during upgrades, perhaps best to select a stable directory elsewhere
const pluginDir = path.join(__dirname, 'installed')
if (!fs.existsSync(pluginDir)) {
  fs.mkdirSync(pluginDir)
}

export async function installPlugin(
  plugin: RegistryPlugin | LocalPlugin
): Promise<Plugins.Plugin> {
  if (!plugin.source) {
    console.warn(`Source not defined for plugin ${plugin.id}`)
    return
  }

  const installedPlugin: Plugins.Plugin = {
    id: plugin.id,
    location: plugin.source
  }

  const client = await getClient()
  if (plugin.local) {
    if (!fs.existsSync(plugin.source)) {
      throw `[installPlugin] Local Plugin ${plugin.id} Cannot Be Installed. Does not exist.`
    }

    await Plugins.Installed.upsert(client, installedPlugin)
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
  const client = await getClient()
  const plugins = await Plugins.Installed.list(client)

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
  const client = await getClient()
  const plugin = await Plugins.Installed.get(client, pluginId)
  if (!plugin) {
    return null
  }

  return loadPlugin(plugin)
}

async function loadPlugin(
  plugin: Plugins.Plugin
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
  if (!instance || typeof instance.loadData !== 'function') {
    console.error(
      `[loadPlugins] ❗️ Bad PluginInstance definition for ${plugin.id} as ${plugin.location}. Recieved: ${instance}`
    )
    return null
  }

  console.log(`[loadPlugins] 😃 Loaded Plugin ${plugin.id}`)

  return instance
}

export async function getRegistry() {
  return await axios.get<Registry>(REGISTRY_URI, {
    validateStatus: (status) => status === 200
  })
}
