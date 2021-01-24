#!/usr/bin/env ts-node-script

import path from 'path'
import fs from 'fs'
import child_process from 'child_process'
import { IPluginInstallationManager, InstallOptions } from './types'
import { SdkLogger } from '@dataden/sdk'

// TODO: determine install directory, make it different in production to dev mode
// const pluginsRoot = path.join(homedir(), '/.dataden-plugins')

interface LocalInstallationManagerConstructor {
  logger?: SdkLogger
}

// TODO: support installing specific versions, listing available versions, etc
export class LocalInstallationManager implements IPluginInstallationManager {
  private log: SdkLogger

  constructor(props: LocalInstallationManagerConstructor) {
    this.log = props.logger ?? console
  }

  /** Is the plugin already installed? */
  isInstalled = (packageJsonPath: string): boolean => {
    return fs.existsSync(this.getPackageJson(packageJsonPath))
  }

  /** Returns the directory containing the package.json, this can be require'd to run the package */
  getInstalledPath = (packageJsonPath: string): string => {
    return path.join(getPluginDir(this.pluginsRoot, packageJsonPath))
  }

  /** Returns the calculated package.json path for a given plugin packageJsonPath */
  getPackageJson = (packageJsonPath: string): string => {
    return path.join(this.getInstalledPath(packageJsonPath), 'package.json')
  }

  // TODO: add isUpgradePossible method

  /** Install the plugin, or optionall update an existing installation */
  install = async (
    packageJsonPath: string,
    opts: InstallOptions = { forceUpdate: false }
  ) => {
    this.log.info(`Attempting install of ${packageJsonPath}`)
  }
}

/** Get the very root of the plugin's installation, just contains: node_modules, package-lock.json */
function getPluginRoot(pluginRoot: string, packageJsonPath: string) {
  return path.join(pluginRoot, packageJsonPath)
}

/** Get the arg to pass to npm, which directs installation to the plugin root */
const getPrefixArg = (pluginRoot: string, packageJsonPath: string) =>
  `--prefix=${getPluginRoot(pluginRoot, packageJsonPath)}`

/** Get the actual directory which the plugin can be found at.
 *
 * Thanks to NPM weirdness and wanting to isolate dependencies from each other, the plugin will be somewhere like:
 * $pluginsRoot/$packageJsonPath/node_modules/$packageJsonPath/package.json
 */
function getPluginDir(pluginRoot: string, packageJsonPath: string) {
  return path.join(
    getPluginRoot(pluginRoot, packageJsonPath),
    'node_modules',
    packageJsonPath
  )
}
