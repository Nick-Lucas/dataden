import { NpmInstallationManager } from './NpmInstallationManager'
import { tmpdir } from 'os'
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import { PluginService, SdkLogger } from '@dataden/sdk'
import { NotFoundError } from './types'

const pluginsRoot = path.join(tmpdir(), '.dataden', '/plugins')

function wipeDir() {
  rimraf.sync(pluginsRoot)
}

const loggerFn = jest.fn()
const logger = {
  info: loggerFn,
  debug: loggerFn,
  warn: loggerFn,
  error: loggerFn
} as SdkLogger

describe('NpmInstallationManager', () => {
  const subject = new NpmInstallationManager({
    pluginsRoot: pluginsRoot,
    logger
  })

  afterEach(() => {
    console.log('LOGGER CALLS', JSON.stringify(loggerFn.mock.calls, null, 2))
    loggerFn.mockReset()
  })

  describe('install dataden-plugin-rng', () => {
    const packageName = 'dataden-plugin-rng'

    beforeAll(async () => {
      console.log('INSTALLING INTO', pluginsRoot)

      wipeDir()

      expect(subject.isInstalled(packageName)).toBe(false)
      await subject.install(packageName)
      expect(subject.isInstalled(packageName)).toBe(true)
    })

    afterEach(() => {
      // require caches the file contents each time it's required, so
      //  we wipe this to allow for mutations of the underlying package index.js
      delete require.cache[packageName]
    })

    afterAll(() => {
      // wipeDir()
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

    it('should install a plugin, and that plugin should import dependencies via its own node_modules directory', () => {
      // Patch the installed plugin to require a dependency and verify the directory tree it's within

      const errorThrow =
        'throw `UUID path was not within the correct tree, found: ${uuidPath} but expected: ' +
        pluginsRoot +
        '`'
      const patch = `
        const uuid = require("uuid")
        const uuidPath = require.resolve("uuid")
  
        uuid.v4()
        if (!uuidPath.includes("${pluginsRoot}")) {
          ${errorThrow}
        }
  
        throw "PATCH_PASSED"
      `

      // Load & patch
      const filePath = path.join(
        subject.getInstalledPath(packageName),
        'dist/index.js'
      )
      const patchedFileContents = fs.readFileSync(filePath).toString() + patch

      // Write Patch
      fs.unlinkSync(filePath)
      expect(fs.existsSync(filePath)).toBe(false)
      fs.writeFileSync(filePath, patchedFileContents)
      expect(fs.existsSync(filePath)).toBe(true)

      // Require uuid locally to ensure it's cached in this instance
      const uuid = require('uuid')
      const uuidPath = require.resolve('uuid')
      expect(uuid?.v4?.()).toBeTruthy()
      expect(uuidPath.includes(pluginsRoot)).toBe(false)

      // Load the patched file and ensure
      // We throw a success error to ensure that no caching has prevented the patch from loading
      // Any other errors are failure.
      try {
        require(subject.getInstalledPath(packageName)) as PluginService
      } catch (e) {
        expect(e).toBe('PATCH_PASSED')
      }
    })
  })

  describe('install non-existent plugin', () => {
    const packageName = '@dataden/unknown-plugin'

    beforeEach(async () => {
      wipeDir()
    })

    afterEach(() => {
      wipeDir()
    })

    it('should fail to install the unknown plugin with a sensible error', async () => {
      expect(subject.isInstalled(packageName)).toBe(false)

      await expect(subject.install(packageName)).rejects.toThrowError(
        new NotFoundError(packageName)
      )

      expect(subject.isInstalled(packageName)).toBe(false)
    })
  })
})
