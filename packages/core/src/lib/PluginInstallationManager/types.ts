export interface InstallOptions {
  forceUpdate: boolean
}

export class NotFoundError extends Error {}

export interface IPluginInstallationManager {
  isInstalled: () => boolean
  getInstalledPath: () => string
  getInstalledVersion: () => string
  getPackageJson: () => string
  install: (opts: InstallOptions) => Promise<void>

  // TODO: add isUpgradePossible method
}
