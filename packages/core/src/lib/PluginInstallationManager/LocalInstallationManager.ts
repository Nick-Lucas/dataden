import path from 'path'
import fs from 'fs'
import {
  IPluginInstallationManager,
  InstallOptions,
  NotFoundError
} from './types'
import { SdkLogger } from '@dataden/sdk'

interface LocalInstallationManagerConstructor {
  packageJsonPath: string
  logger?: SdkLogger
}

export class LocalInstallationManager implements IPluginInstallationManager {
  private packageJsonPath: string
  private log: SdkLogger

  constructor(props: LocalInstallationManagerConstructor) {
    this.packageJsonPath = props.packageJsonPath
    this.log = props.logger ?? console
  }

  /** Is the plugin already installed? */
  isInstalled = (): boolean => {
    try {
      return !!getPluginRoot(this.packageJsonPath)
    } catch (e) {
      return false
    }
  }

  /** Returns the directory containing the package.json, this can be require'd to run the package */
  getInstalledPath = (): string => {
    if (!this.isInstalled()) {
      return null
    }

    return getPluginRoot(this.packageJsonPath)
  }

  getInstalledVersion = (): string => {
    if (!this.isInstalled()) {
      return null
    }

    return require(this.getPackageJson()).version
  }

  /** Returns the calculated package.json path for a given plugin packageJsonPath */
  getPackageJson = (): string => {
    if (!this.isInstalled()) {
      return null
    }

    return path.join(getPluginRoot(this.packageJsonPath), 'package.json')
  }

  isUpgradePossible = () => Promise.resolve(false)

  install = async (opts: Omit<InstallOptions, 'forceUpdate'> = {}) => {
    this.log.info(`Attempting install of ${this.packageJsonPath}`)

    if (this.isInstalled()) {
      return
    }

    throw `Local plugin at ${this.packageJsonPath} could not be found. Are you sure it exists?`
  }
}

/** Get the very root of the plugin's installation, throw if package.json can't be found */
function getPluginRoot(packageJsonPath: string) {
  if (packageJsonPath.endsWith('package.json')) {
    if (fs.existsSync(packageJsonPath)) {
      return path.dirname(packageJsonPath)
    } else {
      throw new NotFoundError(packageJsonPath)
    }
  } else {
    const guessedPath = path.join(packageJsonPath, 'package.json')
    return getPluginRoot(guessedPath)
  }
}
