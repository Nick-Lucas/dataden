export interface InstallOptions {
  forceUpdate: boolean
}

export interface IPluginInstallationManager {
  isInstalled: (packageName: string) => boolean
  getInstalledPath: (packageName: string) => string
  getPackageJson: (packageName: string) => string
  install: (packageName: string, opts: InstallOptions) => Promise<void>
}
