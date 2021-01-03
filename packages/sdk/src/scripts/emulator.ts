import path from 'path'
import fs from 'fs'

import chalk from 'chalk'

import {
  PluginService,
  pluginInstanceIsValid as pluginIsValid,
  Settings
} from 'src/core'

export interface RunOptions {
  inputFile: string
  settings: string
  output: string
  loader: number
  skipBuild: boolean
}

export async function run({
  inputFile,
  settings: settingsPath,
  output,
  loader: loaderIndex
}: RunOptions) {
  const entryFileName = path.basename(inputFile).split('.')[0]
  const entryFilePath = path.join(process.cwd(), 'dist', entryFileName + '.js')
  console.log('Starting emulator for', entryFilePath)

  const plugin = require(entryFilePath) as PluginService
  if (!pluginIsValid(plugin)) {
    throw 'Plugin Validation Failed'
  }

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

  const settings: Settings = { ...defaultSettings, ...settingsFromFile }

  for (let l = 0; l < plugin.loaders.length; l++) {
    if (loaderIndex >= 0 && l !== loaderIndex) {
      continue
    }

    const { name, load } = plugin.loaders[l]
    console.log('')
    console.log(chalk.gray('_______'))
    console.log(chalk.green('Running loader'), name)

    try {
      const payload = await load(
        settings,
        { lastSync: { date: new Date(0).toISOString(), success: false } },
        console
      )

      const writeOutput = path.normalize(
        path.join(
          process.cwd(),
          (output ? output : 'output') + '_' + name + '.json'
        )
      )
      console.log(chalk.green('Writing result to'), writeOutput)

      const payloadJson = JSON.stringify(payload, null, 2)
      if (fs.existsSync(writeOutput)) {
        fs.unlinkSync(writeOutput)
      }
      fs.mkdirSync(path.dirname(writeOutput), { recursive: true })
      fs.writeFileSync(writeOutput, payloadJson)
    } catch (e) {
      console.error(chalk.red('Loader', name, 'failed with', String(e)))
    }

    console.log(chalk.gray('_______'))
  }
}
