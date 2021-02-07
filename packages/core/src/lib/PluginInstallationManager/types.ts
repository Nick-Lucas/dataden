export interface InstallOptions {
  forceUpdate: boolean
}

export interface UpgradeInfo {
  updatable: boolean
  currentVersion: string
  nextVersion: string
}

export class NotFoundError extends Error {}

export interface IPluginInstallationManager {
  isInstalled: () => boolean
  getInstalledPath: () => string
  getInstalledVersion: () => string
  getUpgradeInfo: () => Promise<UpgradeInfo>
  getPackageJson: () => string
  install: (opts: InstallOptions) => Promise<void>
}
