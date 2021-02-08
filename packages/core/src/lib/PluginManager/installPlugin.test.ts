jest.mock('./getInstallationManager')
const getInstallationManagerMock = jest.requireMock(
  './getInstallationManager.ts'
)

import { NotFoundError } from 'src/lib/PluginInstallationManager'
import { wipeDb } from 'src/db/__mocks__/getClient'
import { getClient, Plugins } from 'src/db'

import {
  installPlugin,
  InstallPluginError,
  PluginConflictError
} from './installPlugin'
import { MongoClient } from 'mongodb'

describe('PluginManager', () => {
  describe('installPlugin', () => {
    let client: MongoClient

    beforeEach(async () => {
      client = await getClient()
      await wipeDb()
      getInstallationManagerMock.resetInstallationStates()
    })

    it('should install plugin', async () => {
      const pluginId = getInstallationManagerMock.PLUGIN_IDS.installable

      await installPlugin({
        id: pluginId,
        description: 'Test Plugin',
        local: true,
        source: pluginId
      })

      const installedPlugin = await Plugins.Installed.get(client, pluginId)
      expect(installedPlugin?.id).toBe(pluginId)
    })

    it('should reject already installed plugin', async () => {
      const pluginId = getInstallationManagerMock.PLUGIN_IDS.installable

      await Plugins.Installed.upsert(client, {
        id: pluginId,
        instances: [],
        local: true,
        location: '',
        source: pluginId,
        version: ''
      })

      await expect(
        installPlugin({
          id: pluginId,
          description: 'Test Plugin',
          local: true,
          source: pluginId
        })
      ).rejects.toThrowError(new PluginConflictError())

      const installedPlugins = await Plugins.Installed.list(client)
      expect(installedPlugins.length).toEqual(1)
    })

    it('reject when no source provided', async () => {
      const pluginId = getInstallationManagerMock.PLUGIN_IDS.unavailable

      await expect(
        installPlugin({
          id: pluginId,
          description: 'Test Plugin',
          local: true,
          source: null
        })
      ).rejects.toThrowError(
        new InstallPluginError('Plugin source not provided')
      )

      const installedPlugins = await Plugins.Installed.list(client)
      expect(installedPlugins).toEqual([])
    })

    it('should reject unavailable plugin', async () => {
      const pluginId = getInstallationManagerMock.PLUGIN_IDS.unavailable

      await expect(
        installPlugin({
          id: pluginId,
          description: 'Test Plugin',
          local: true,
          source: pluginId
        })
      ).rejects.toThrowError(new NotFoundError('NOT FOUND: ' + pluginId))

      const installedPlugins = await Plugins.Installed.list(client)
      expect(installedPlugins).toEqual([])
    })
  })
})
