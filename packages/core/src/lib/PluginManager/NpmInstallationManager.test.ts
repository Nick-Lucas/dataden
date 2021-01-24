import { NpmInstallationManager } from './NpmInstallationManager'
import { tmpdir } from 'os'
import path from 'path'
import rimraf from 'rimraf'
import { PluginService } from '@dataden/sdk'

const pluginsRoot = path.join(tmpdir(), '.temp', '/plugins')

function wipeDir() {
  rimraf.sync(pluginsRoot)
}

describe('NpmInstallationManager', () => {
  const subject = new NpmInstallationManager({ pluginsRoot: pluginsRoot })
  const packageName = 'dataden-plugin-rng'

  beforeAll(async () => {
    console.log('INSTALLING INTO', pluginsRoot)

    wipeDir()

    expect(subject.isInstalled(packageName)).toBe(false)
    await subject.install(packageName)
    expect(subject.isInstalled(packageName)).toBe(true)
  })

  afterAll(() => {
    wipeDir()
  })

  it('should install a plugin and be able to verify it', async () => {
    expect(subject.isInstalled(packageName)).toBe(true)
  })

  it('should install a plugin and be able to load it', async () => {
    const packageJsonPath = subject.getPackageJson(packageName)
    expect(packageJsonPath.endsWith('package.json')).toBe(true)

    const packageJson = require(packageJsonPath)
    expect(packageJson.name).toBe('dataden-plugin-rng')
  })

  it('should install a plugin and be able to run it', async () => {
    const pluginService = require(subject.getInstalledPath(
      packageName
    )) as PluginService

    expect(pluginService?.loaders?.length ?? -1).toBeGreaterThan(0)
  })
})
