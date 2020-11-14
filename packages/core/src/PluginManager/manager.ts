import fs from 'fs'
import path from 'path'
import axios from 'axios'

import { LocalPlugin, Registry, RegistryPlugin } from './types'

import { getClient, Plugins } from 'src/db'

import { DataLoader } from '@mydata/sdk'

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

    await Plugins.upsert(client, installedPlugin)
  } else {
    throw '[installPlugin] Remot Plugin Install: Not Implemented'
    // TODO: download to directory
    // TODO: register local location
  }

  return installedPlugin
}

export function uninstallPlugin(pluginId: string) {
  throw '[uninstallPlugin] Not Implemented'
}

export async function loadPlugins(): Promise<DataLoader[]> {
  const client = await getClient()
  const plugins = await Plugins.get(client)

  console.log(`[loadPlugins] ${plugins?.length ?? 0} Plugins will be loaded`)

  const loaders: DataLoader[] = []
  for (const plugin of plugins) {
    const exists = fs.existsSync(plugin.location)
    if (!exists) {
      console.warn(
        `[loadPlugins] 😒 Plugin ${plugin.id} at location ${plugin.location} has disappeared`
      )
      continue
    }

    const dataLoader = require(plugin.location) as DataLoader
    if (!dataLoader || typeof dataLoader.loadData !== 'function') {
      console.error(
        `[loadPlugins] ❗️ Bad DataLoader definition for ${plugin.id} as ${plugin.location}. Recieved: ${dataLoader}`
      )
      continue
    }

    console.log(`[loadPlugins] 😃 Loaded Plugin ${plugin.id}`)

    loaders.push(dataLoader)
  }

  return loaders
}

export async function getRegistry() {
  return await axios.get<Registry>(REGISTRY_URI, {
    validateStatus: (status) => status === 200
  })
}
