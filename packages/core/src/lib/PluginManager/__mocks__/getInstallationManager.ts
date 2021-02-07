import {
  InstallOptions,
  IPluginInstallationManager,
  UpgradeInfo,
  NotFoundError
} from 'src/lib/PluginInstallationManager'

export const PLUGIN_IDS = {
  installable: 'installable_annie',
  installed: 'installed_andy',
  unavailable: 'unavailable_irene',
  upgradeable: 'upgradeable_enix'
}

let installed = {}
let upgraded = {}
export function resetInstallationStates() {
  installed = {
    [PLUGIN_IDS.unavailable]: false,
    [PLUGIN_IDS.installable]: false,
    [PLUGIN_IDS.installed]: true,
    [PLUGIN_IDS.upgradeable]: true
  }
  upgraded = {
    [PLUGIN_IDS.upgradeable]: false
  }
}
resetInstallationStates()

export function getInstallationManager(
  local: boolean,
  nameSourcePathLocationEtc: string
): IPluginInstallationManager {
  let MockInstallationManager = null

  if (
    [PLUGIN_IDS.installable, PLUGIN_IDS.installed].includes(
      nameSourcePathLocationEtc
    )
  ) {
    MockInstallationManager = class implements IPluginInstallationManager {
      isInstalled = () => !!installed[nameSourcePathLocationEtc]
      getInstalledPath = () =>
        !!installed[nameSourcePathLocationEtc] ? 'path/to/stub' : null
      getInstalledVersion = () =>
        !!installed[nameSourcePathLocationEtc] ? '1.0.0' : null
      getUpgradeInfo = () =>
        !!installed[nameSourcePathLocationEtc]
          ? Promise.resolve<UpgradeInfo>({
              currentVersion: '1.0.0',
              nextVersion: '1.0.0',
              updatable: false
            })
          : Promise.resolve<UpgradeInfo>({
              currentVersion: null,
              nextVersion: null,
              updatable: false
            })
      getPackageJson = () =>
        !!installed[nameSourcePathLocationEtc]
          ? 'path/to/stub/package.json'
          : null
      install = (opts: InstallOptions) => {
        installed[nameSourcePathLocationEtc] = true
        return Promise.resolve()
      }
    }
  }

  if (nameSourcePathLocationEtc === PLUGIN_IDS.unavailable) {
    MockInstallationManager = class implements IPluginInstallationManager {
      isInstalled = () => false
      getInstalledPath = () => null
      getInstalledVersion = () => null
      getUpgradeInfo = () => null
      getPackageJson = () => nameSourcePathLocationEtc
      install = () =>
        Promise.reject(
          new NotFoundError('NOT FOUND: ' + nameSourcePathLocationEtc)
        )
    }
  }

  if (nameSourcePathLocationEtc === PLUGIN_IDS.upgradeable) {
    MockInstallationManager = class implements IPluginInstallationManager {
      isInstalled = () => !!installed[nameSourcePathLocationEtc]
      getInstalledPath = () =>
        !!installed[nameSourcePathLocationEtc] ? 'path/to/stub' : null
      getInstalledVersion = () =>
        !!installed[nameSourcePathLocationEtc]
          ? upgraded[nameSourcePathLocationEtc]
            ? '2.0.0'
            : '1.0.0'
          : null
      getUpgradeInfo = () =>
        !!installed[nameSourcePathLocationEtc]
          ? upgraded[nameSourcePathLocationEtc]
            ? Promise.resolve<UpgradeInfo>({
                currentVersion: '2.0.0',
                nextVersion: '2.0.0',
                updatable: false
              })
            : Promise.resolve<UpgradeInfo>({
                currentVersion: '1.0.0',
                nextVersion: '2.0.0',
                updatable: true
              })
          : Promise.resolve<UpgradeInfo>({
              currentVersion: null,
              nextVersion: null,
              updatable: false
            })
      getPackageJson = () =>
        !!installed[nameSourcePathLocationEtc]
          ? 'path/to/stub/package.json'
          : null
      install = (opts: InstallOptions) => {
        installed[nameSourcePathLocationEtc] = true
        upgraded[nameSourcePathLocationEtc] = true
        return Promise.resolve()
      }
    }
  }

  if (MockInstallationManager == null) {
    throw `PluginId must be one of: ${Object.values(PLUGIN_IDS).join(
      ', '
    )} as defined in ${__filename}`
  }

  return new MockInstallationManager()
}
