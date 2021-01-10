import * as yargs from 'yargs'
import child_process from 'child_process'
import fs from 'fs'
import path from 'path'
import { run } from './emulator'

yargs
  .command(
    'build [inputFile]',
    'build plugin for deployment',
    (yargs) => {
      yargs
        .positional('inputFile', {
          describe: 'the .ts/.js file serving the entrypoint of your plugin',
          default: 'src/index.ts',
          type: 'string'
        })
        .option('watch', {
          alias: 'w',
          type: 'boolean',
          description: 'watch files and rebuild on change'
        })
    },
    ({ inputFile, watch }: BuildConfig) => {
      console.log('Build triggered for ', inputFile)

      spawnBuild({ inputFile, watch })
    }
  )
  .command(
    ['run [inputFile]', 'emulator'],
    'runs the plugin and sends to resulting data to json files for testing purposes',
    (yargs) => {
      yargs
        .positional('inputFile', {
          describe: 'the .ts/.js file serving the entrypoint of your plugin',
          default: 'src/index.ts',
          type: 'string'
        })
        .option('skip-build', {
          alias: 'b',
          type: 'boolean'
        })
        .option('settings', {
          alias: 's',
          type: 'string'
        })
        .option('output', {
          alias: 'o',
          type: 'string'
        })
        .option('loader', {
          alias: 'l',
          type: 'number',
          describe:
            'Which loader (0-based index) to run? Default: all loaders will run'
        })
    },
    async (
      options: BuildConfig & {
        settings: string
        output: string
        loader: number
        skipBuild: boolean
      }
    ) => {
      const { inputFile, skipBuild } = options

      if (skipBuild) {
        console.log('Skipping build')
      } else {
        console.log('Starting build for', inputFile)
        await spawnBuild({ inputFile })
      }

      await run(options)
    }
  )
  .recommendCommands().argv

interface BuildConfig {
  inputFile: string
  watch?: boolean
}

function spawnBuild({ inputFile, watch = false }: BuildConfig) {
  const child = child_process.spawn(
    'node',
    [
      fs.realpathSync(path.join(__dirname, '../node_modules/.bin', 'rollup')),
      '-c',
      path.normalize(__dirname + '/../configs/rollup.plugin.config.js'),
      inputFile,
      watch && '--watch'
    ].filter(Boolean),
    { stdio: 'inherit' }
  )

  return new Promise((resolve) => {
    child.on('exit', (code) => resolve(code))
  })
}
