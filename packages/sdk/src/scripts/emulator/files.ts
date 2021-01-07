import fs from 'fs'
import path from 'path'
import { pluginInstanceIsValid, PluginService, Settings } from 'src/core'

export function runPlugin(fileName: string): PluginService {
  const entryFileName = path.basename(fileName).split('.')[0]

  const entryFilePath = path.join(process.cwd(), 'dist', entryFileName + '.js')
  console.log('Starting emulator for', entryFilePath)

  const plugin = require(entryFilePath) as PluginService
  if (!pluginInstanceIsValid(plugin)) {
    throw 'Plugin Validation Failed'
  }

  return plugin
}

export async function loadAndMergeSettings(
  plugin: PluginService,
  settingsPath: string
): Promise<Settings> {
  const defaultSettings = await plugin.getDefaultSettings()
  let settingsFromFile: Settings = {
    plugin: {},
    schedule: { every: 1, grain: 'day' },
    secrets: {}
  }

  if (settingsPath) {
    if (!settingsPath.endsWith('.json')) {
      throw 'Settings should be a .json file'
    }

    const fullPath = path.normalize(path.join(process.cwd(), settingsPath))

    console.log('Loading settings from:', fullPath)
    settingsFromFile = require(fullPath)
  }

  return { ...defaultSettings, ...settingsFromFile }
}

//
// IO

export function getOutputFilePath(loaderName: string, outputFileHint: string) {
  return path.normalize(
    path.join(
      process.cwd(),
      (outputFileHint ? outputFileHint : 'output') + '_' + loaderName + '.json'
    )
  )
}

export function getAuthCacheFilePath() {
  return path.normalize(path.join(process.cwd(), '.authcache.json'))
}

export function writeJson(filePath: string, payload: Record<string, any>) {
  const payloadJson = JSON.stringify(payload, null, 2)

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  fs.mkdirSync(path.dirname(filePath), { recursive: true })

  fs.writeFileSync(filePath, payloadJson)
}
