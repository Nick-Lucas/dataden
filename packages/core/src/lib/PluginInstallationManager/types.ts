export interface InstallOptions {
  forceUpdate: boolean
}

export interface IPluginInstallationManager {
  isInstalled: (packageLocator: string) => boolean
  getInstalledPath: (packageLocator: string) => string
  getPackageJson: (packageLocator: string) => string
  install: (packageLocator: string, opts: InstallOptions) => Promise<void>
}
