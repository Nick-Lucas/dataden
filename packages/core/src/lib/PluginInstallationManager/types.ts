export interface InstallOptions {
  forceUpdate: boolean
}

export class NotFoundError extends Error {}

export interface IPluginInstallationManager {
  isInstalled: () => boolean
  getInstalledPath: () => string
  getInstalledVersion: () => string
  isUpgradePossible: () => Promise<boolean>
  getPackageJson: () => string
  install: (opts: InstallOptions) => Promise<void>
}
