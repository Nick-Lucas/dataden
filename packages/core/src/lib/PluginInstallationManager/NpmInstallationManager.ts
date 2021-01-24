import path from 'path'
import fs from 'fs'
import child_process from 'child_process'
import {
  IPluginInstallationManager,
  InstallOptions,
  NotFoundError
} from './types'
import { SdkLogger } from '@dataden/sdk'

// TODO: determine install directory, make it different in production to dev mode
// const pluginsRoot = path.join(homedir(), '/.dataden-plugins')

interface NpmInstallationManagerConstructor {
  pluginsRoot: string
  packageName: string
  logger?: SdkLogger
}

// TODO: support installing specific versions, listing available versions, etc
export class NpmInstallationManager implements IPluginInstallationManager {
  private pluginsRoot: string
  private packageName: string
  private log: SdkLogger

  constructor(props: NpmInstallationManagerConstructor) {
    this.pluginsRoot = props.pluginsRoot
    this.packageName = props.packageName
    this.log = props.logger ?? console
  }

  /** Is the plugin already installed? */
  isInstalled = (): boolean => {
    return fs.existsSync(this.getPackageJson())
  }

  /** Returns the directory containing the package.json, this can be require'd to run the package */
  getInstalledPath = (): string => {
    if (!this.isInstalled()) {
      return null
    }

    return path.join(getPluginDir(this.pluginsRoot, this.packageName))
  }

  getInstalledVersion = (): string => {
    if (!this.isInstalled()) {
      return null
    }

    return require(this.getPackageJson()).version
  }

  /** Returns the calculated package.json path for a given plugin packageName */
  getPackageJson = (): string => {
    if (!this.isInstalled()) {
      return null
    }

    return path.join(this.getInstalledPath(), 'package.json')
  }

  /** Install the plugin, or optionall update an existing installation */
  install = async (opts: InstallOptions = { forceUpdate: false }) => {
    this.log.info(`Attempting install of ${this.packageName}`)

    // Ensure that the plugin's install directory exists
    const pluginRoot = getPluginRoot(this.pluginsRoot, this.packageName)
    if (!fs.existsSync(pluginRoot)) {
      fs.mkdirSync(pluginRoot, { recursive: true })
    }

    if (!this.isInstalled() || opts.forceUpdate) {
      this.log.info(`Will Install`)

      // Create a dummy package.json to make npm feel happy inside
      child_process.spawnSync('npm', ['init', '--yes', '--force'], {
        cwd: pluginRoot
      })

      const log = this.log
      await new Promise((resolve, reject) => {
        const child = child_process.spawn('npm', [
          'install',
          '--no-save',
          getPrefixArg(this.pluginsRoot, this.packageName),
          this.packageName
        ])

        function rejectAndKill(reason) {
          reject(reason)
          child.kill('SIGKILL')
        }

        child.on('error', (err) => {
          log.error(err)
          rejectAndKill(err)
        })

        child.on('exit', (code) => {
          if (code == 0) {
            log.info('npm install finished')
            resolve(null)
          } else if (code == null) {
            // This is fine, it was killed by this process
          } else {
            log.warn('npm exited with ' + code)
            rejectAndKill(`Non-zero exit code ${code} recieved`)
          }
        })

        child.stdout.on('data', (chunk) => {
          log.info(chunk?.toString() ?? chunk)
        })

        child.stderr.on('data', (chunk) => {
          const err: string = chunk?.toString() ?? chunk
          if (err.includes('code E404')) {
            rejectAndKill(new NotFoundError(this.packageName))
          }
          log.warn(chunk?.toString() ?? chunk)
        })
      })

      this.log.info(`Installed Successfully`)
    } else {
      this.log.info(`Already Installed`)
    }
  }
}

/** Get the very root of the plugin's installation, just contains: node_modules, package-lock.json */
function getPluginRoot(pluginsRoot: string, packageName: string) {
  return path.join(pluginsRoot, 'installed-' + packageName.replace(/\//, '-'))
}

/** Get the arg to pass to npm, which directs installation to the plugin root */
const getPrefixArg = (pluginsRoot: string, packageName: string) =>
  `--prefix=${getPluginRoot(pluginsRoot, packageName)}`

/** Get the actual directory which the plugin can be found at.
 *
 * Thanks to NPM weirdness and wanting to isolate dependencies from each other, the plugin will be somewhere like:
 * $pluginsRoot/$packageName/node_modules/$packageName/package.json
 */
function getPluginDir(pluginsRoot: string, packageName: string) {
  return path.join(
    getPluginRoot(pluginsRoot, packageName),
    'node_modules',
    packageName
  )
}
