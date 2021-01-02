import * as yargs from 'yargs'
import child_process from 'child_process'
import path from 'path'

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
  .command('*', false, () => {
    yargs.showHelp()
  })
  .recommendCommands().argv

interface BuildConfig {
  inputFile: string
  watch?: boolean
}

function spawnBuild({ inputFile, watch = false }: BuildConfig) {
  child_process.spawn(
    'node',
    [
      path.normalize(path.join(__dirname, '../node_modules/.bin', 'rollup')),
      '-c',
      path.normalize(__dirname + '/../configs/rollup.plugin.config.js'),
      inputFile,
      watch && '--watch'
    ].filter(Boolean),
    { stdio: 'inherit' }
  )
}
