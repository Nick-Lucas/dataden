export interface InstallOptions {
  forceUpdate: boolean
}

export class NotFoundError extends Error {}

export interface IPluginInstallationManager {
  isInstalled: (packageLocator: string) => boolean
  getInstalledPath: (packageLocator: string) => string
  getPackageJson: (packageLocator: string) => string
  install: (packageLocator: string, opts: InstallOptions) => Promise<void>
}
