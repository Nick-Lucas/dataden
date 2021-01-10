import chalk from 'chalk'

import {
  getOutputFilePath,
  loadAndMergeSettings,
  runPlugin,
  writeJson
} from './files'
import { getAuthResult } from './auth'

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
  const plugin = runPlugin(inputFile)
  const settings = await loadAndMergeSettings(plugin, settingsPath)

  const tokens = await getAuthResult(plugin, settings)
  console.log('Tokens recieved')

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
        {
          lastSync: { success: true, rehydrationData: {} },
          auth: tokens
        },
        console
      )

      const outputFilePath = getOutputFilePath(name, output)
      console.log(chalk.green('Writing result to'), outputFilePath)

      writeJson(outputFilePath, payload)
    } catch (e) {
      console.error(chalk.red('Loader', name, 'failed with', String(e)))
      console.error(e)
      if (e?.response?.data) {
        console.error(e?.response?.data)
      }
    }

    console.log(chalk.gray('_______'))
  }
}
