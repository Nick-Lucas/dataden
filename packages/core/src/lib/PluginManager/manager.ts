import fs from 'fs'
import path from 'path'
import axios, { AxiosResponse } from 'axios'
import { Stream } from 'stream'
import extractZip from 'extract-zip'
import _ from 'lodash'

import {
  LocalPlugin,
  PluginServiceDefinition,
  Registry,
  RegistryPlugin
} from './types'

import * as Db from 'src/db'

import { PluginService, pluginInstanceIsValid } from '@dataden/sdk'

import { getScoped } from 'src/logging'
const log = getScoped('PluginManager')

const REGISTRY_URI =
  'https://raw.githubusercontent.com/Nick-Lucas/dataden/master/meta/registry.json'

// TODO: this will be next to the bundle which may not be ideal during upgrades, perhaps best to select a stable directory elsewhere
const pluginDir = path.join(__dirname, 'installed')
if (!fs.existsSync(pluginDir)) {
  fs.mkdirSync(pluginDir)
}
function getPluginDir(pluginId: string, ...extra: string[]) {
  const location = path.join(pluginDir, pluginId, ...extra)
  if (!fs.existsSync(location)) {
    fs.mkdirSync(location, { recursive: true })
  }

  return location
}

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

  const plugin: Db.Plugins.Plugin = {
    id: registryPlugin.id,
    location: registryPlugin.source,
    version: (registryPlugin as RegistryPlugin).version ?? -1,
    instances: [
      {
        name: 'default'
      }
    ]
  }

  const client = await Db.getClient()

  const installedPlugin = await Db.Plugins.Installed.get(
    client,
    registryPlugin.id
  )
  if (installedPlugin) {
    log.warn(
      `Plugin was alrady installed \n${JSON.stringify(
        installedPlugin,
        null,
        2
      )}`
    )
    throw new PluginConflictError()
  }

  if (registryPlugin.local) {
    if (!fs.existsSync(registryPlugin.source)) {
      const message = `[installPlugin] Local Plugin ${registryPlugin.id} Cannot Be Installed. Does not exist.`
      log.warn(message)
      throw message
    }

    return await Db.Plugins.Installed.upsert(client, plugin)
  } else {
    const pluginDir = getPluginDir(plugin.id)

    const extension = registryPlugin.source.includes('.')
      ? _.last(registryPlugin.source.split('.'))
      : null

    const downloadLocation = path.join(
      pluginDir,
      'download' + (extension ? '.' + extension : '')
    )

    const file = fs.createWriteStream(downloadLocation)
    const stream = await axios.get<Stream>(registryPlugin.source, {
      responseType: 'stream'
    })
    await new Promise((resolve) => {
      stream.data.pipe(file).on('close', resolve)
    })

    if (extension === 'js') {
      plugin.location = path.join(pluginDir, 'index.js')
      fs.renameSync(downloadLocation, plugin.location)
    } else {
      try {
        await extractZip(downloadLocation, { dir: pluginDir })
      } catch (e) {
        throw `Could not extract '${downloadLocation}' as an archive, is it something else? ${e}`
      }

      fs.unlinkSync(downloadLocation)

      // const files = fs
      //   .readdirSync(pluginDir, { withFileTypes: true })
      //   .filter((file) => file.isFile() && file.name.endsWith('.js'))

      // console.log(files)

      // if (files.length === 1) {
      //   plugin.location = files[0].name
      // }

      plugin.location = downloadLocation
    }

    return plugin
    // TODO: reinstate this
    // return await Db.Plugins.Installed.upsert(client, plugin)
  }
}

export function uninstallPlugin(pluginId: string) {
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
