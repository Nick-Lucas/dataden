#!/usr/bin/env ts-node-script

import path from 'path'
import fs from 'fs'
import child_process from 'child_process'
import { IPluginInstallationManager, InstallOptions } from './types'
import { SdkLogger } from '@dataden/sdk'

// TODO: determine install directory, make it different in production to dev mode
// const pluginsRoot = path.join(homedir(), '/.dataden-plugins')

interface NpmInstallationManagerConstructor {
  pluginsRoot: string
  logger?: SdkLogger
}

// TODO: support installing specific versions, listing available versions, etc
export class NpmInstallationManager implements IPluginInstallationManager {
  private pluginsRoot: string
  private log: SdkLogger

  constructor(props: NpmInstallationManagerConstructor) {
    this.pluginsRoot = props.pluginsRoot
    this.log = props.logger ?? console
  }

  /** Is the plugin already installed? */
  isInstalled = (packageName: string): boolean => {
    return fs.existsSync(this.getPackageJson(packageName))
  }

  /** Returns the directory containing the package.json, this can be require'd to run the package */
  getInstalledPath = (packageName: string): string => {
    return path.join(getPluginDir(this.pluginsRoot, packageName))
  }

  /** Returns the calculated package.json path for a given plugin packageName */
  getPackageJson = (packageName: string): string => {
    return path.join(this.getInstalledPath(packageName), 'package.json')
  }

  // TODO: add isUpgradePossible method

  /** Install the plugin, or optionall update an existing installation */
  install = async (
    packageName: string,
    opts: InstallOptions = { forceUpdate: false }
  ) => {
    this.log.info(`Attempting install of ${packageName}`)
    if (!fs.existsSync(this.pluginsRoot)) {
      fs.mkdirSync(this.pluginsRoot, { recursive: true })
    }

    if (!this.isInstalled(packageName) || opts.forceUpdate) {
      this.log.info(`Will Install`)

      child_process.spawnSync('npm', [
        'install',
        getPrefixArg(this.pluginsRoot, packageName),
        packageName
      ])

      this.log.info(`Installed Successfully`)
    } else {
      this.log.info(`Already Installed`)
    }
  }
}

/** Get the very root of the plugin's installation, just contains: node_modules, package-lock.json */
function getPluginRoot(pluginRoot: string, packageName: string) {
  return path.join(pluginRoot, packageName)
}

/** Get the arg to pass to npm, which directs installation to the plugin root */
const getPrefixArg = (pluginRoot: string, packageName: string) =>
  `--prefix=${getPluginRoot(pluginRoot, packageName)}`

/** Get the actual directory which the plugin can be found at.
 *
 * Thanks to NPM weirdness and wanting to isolate dependencies from each other, the plugin will be somewhere like:
 * $pluginsRoot/$packageName/node_modules/$packageName/package.json
 */
function getPluginDir(pluginRoot: string, packageName: string) {
  return path.join(
    getPluginRoot(pluginRoot, packageName),
    'node_modules',
    packageName
  )
}
