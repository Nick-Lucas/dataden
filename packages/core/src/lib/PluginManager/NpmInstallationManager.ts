#!/usr/bin/env ts-node-script

import path from 'path'
import fs from 'fs'
import child_process from 'child_process'

const thisRoot = __dirname // TODO: find the package root for this project

// TODO: determine install directory, make it different in production to dev mode
// const pluginsRoot = path.join(homedir(), '/.dataden-plugins')

interface NpmInstallationManagerConstructor {
  pluginsRoot: string
}

interface InstallOptions {
  forceUpdate: boolean
}

// TODO: support installing specific versions, listing available versions, etc
export class NpmInstallationManager {
  private pluginsRoot: string

  constructor(props: NpmInstallationManagerConstructor) {
    this.pluginsRoot = props.pluginsRoot
  }

  /** Is the plugin already installed? */
  isInstalled = (packageName: string): boolean => {
    return fs.existsSync(this.getPackageJson(packageName))
  }

  /** Returns the directory containing the package.json */
  getInstalledPath = (packageName: string): string => {
    return path.join(getPluginDir(this.pluginsRoot, packageName))
  }

  /** Returns the calculated package.json path for a given plugin packageName */
  getPackageJson = (packageName: string): string => {
    return path.join(this.getInstalledPath(packageName), 'package.json')
  }

  // TODO: add isUpgradePossible method

  /** Install the plugin, or optionall update an existing installation */
  install = (
    packageName: string,
    opts: InstallOptions = { forceUpdate: false }
  ) => {
    if (!fs.existsSync(this.pluginsRoot)) {
      fs.mkdirSync(this.pluginsRoot, { recursive: true })
    }

    if (!this.isInstalled(packageName) || opts.forceUpdate) {
      child_process.spawnSync('npm', [
        'install',
        getPrefixArg(this.pluginsRoot, packageName),
        packageName
      ])
    }

    // We link the package itself through npm
    child_process.spawnSync('npm', ['link'], {
      cwd: getPluginRoot(this.pluginsRoot, packageName)
    })

    // We then symlink the linked package into the dataden project
    child_process.spawnSync('npm', ['link', packageName], {
      cwd: thisRoot
    })
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
