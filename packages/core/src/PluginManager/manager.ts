import fs from 'fs'
import path from 'path'
import axios from 'axios'

import { Registry, RegistryPlugin } from './types'

const REGISTRY_URI =
  'https://raw.githubusercontent.com/Nick-Lucas/mydata/master/meta/registry.json'

// TODO: this will be next to the bundle which may not be ideal during upgrades, perhaps best to select a stable directory elsewhere
const pluginDir = path.join(__dirname, 'installed')
if (!fs.existsSync(pluginDir)) {
  fs.mkdirSync(pluginDir)
}

export function installPlugin(plugin: RegistryPlugin) {
  if (!plugin.source) {
    console.warn(`Source not defined for plugin ${plugin.id}`)
    return
  }

  throw 'Not Implemented'
}

export function uninstallPlugin(pluginId: string) {
  throw 'Not Implemented'
}

export function loadPlugins() {
  const files = fs.readdirSync(pluginDir)

  console.log('FILES LOADED FROM', pluginDir)
  for (const file of files) {
    console.log('FILE', file)
  }
}

export async function getRegistry() {
  return await axios.get<Registry>(REGISTRY_URI, {
    validateStatus: (status) => status === 200
  })
}
