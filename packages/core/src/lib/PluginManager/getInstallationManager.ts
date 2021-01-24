import fs from 'fs'
import path from 'path'
import { homedir } from 'os'

import { getConfig } from 'src/config'

import {
  IPluginInstallationManager,
  LocalInstallationManager,
  NpmInstallationManager
} from 'src/lib/PluginInstallationManager'

import { getScoped } from 'src/logging'

const pluginInstallDirectory = getConfig().IS_PRODUCTION
  ? path.join(homedir(), '.dataden-plugins')
  : path.join(__dirname, 'installed')

if (!fs.existsSync(pluginInstallDirectory)) {
  fs.mkdirSync(pluginInstallDirectory)
}

export function getInstallationManager(
  local: boolean,
  nameSourcePathLocationEtc: string
): IPluginInstallationManager {
  if (local) {
    return new LocalInstallationManager({
      packageJsonPath: nameSourcePathLocationEtc,
      logger: getScoped('LocalInstall')
    })
  } else {
    return new NpmInstallationManager({
      pluginsRoot: pluginInstallDirectory,
      packageName: nameSourcePathLocationEtc,
      logger: getScoped('NpmInstall')
    })
  }
}
