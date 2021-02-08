jest.mock('./getInstallationManager')

import { UpgradeInfo } from 'src/lib/PluginInstallationManager'
import { wipeDb } from 'src/db/__mocks__/getClient'
import { getClient, Plugins } from 'src/db'

import { upgradePlugin, getUpgradeInfo } from './upgradePlugin'
import { MongoClient } from 'mongodb'

const getInstallationManagerMock = jest.requireMock(
  './getInstallationManager.ts'
)

describe('PluginManager', () => {
  describe('upgradePlugin & getUpgradeInfo', () => {
    let client: MongoClient
    const pluginId = getInstallationManagerMock.PLUGIN_IDS.upgradeable

    beforeEach(async () => {
      client = await getClient()
      await wipeDb()
      getInstallationManagerMock.resetInstallationStates()

      await Plugins.Installed.upsert(client, {
        id: pluginId,
        instances: [],
        local: true,
        location: pluginId,
        source: pluginId,
        version: '1.0.0'
      })
    })

    describe('getUpgradeInfo', () => {
      it('should get an available upgrade', async () => {
        const upgradeInfo = await getUpgradeInfo(pluginId)
        expect(upgradeInfo).toEqual({
          currentVersion: '1.0.0',
          nextVersion: '2.0.0',
          updatable: true
        } as UpgradeInfo)
      })

      it('should not get an available upgrade after an upgrade', async () => {
        await upgradePlugin(pluginId, { inline: true })

        const upgradeInfo = await getUpgradeInfo(pluginId)
        expect(upgradeInfo).toEqual({
          currentVersion: '2.0.0',
          nextVersion: '2.0.0',
          updatable: false
        } as UpgradeInfo)
      })

      it('should not get an available upgrade for an uninstalled plugin', async () => {
        const upgradeInfo = await getUpgradeInfo('non-existent-plugin-id')
        expect(upgradeInfo).toBe(null)
      })
    })

    describe('upgradePlugin', () => {
      it('should install plugin inline', async () => {
        let installedPlugin = await Plugins.Installed.get(client, pluginId)
        expect(installedPlugin?.id).toBe(pluginId)
        expect(installedPlugin?.version).toBe('1.0.0')

        const result = await upgradePlugin(pluginId, { inline: true })
        expect(result).toBe(true)

        installedPlugin = await Plugins.Installed.get(client, pluginId)
        expect(installedPlugin?.id).toBe(pluginId)
        expect(installedPlugin?.version).toBe('2.0.0')
      })

      it('should install plugin with offline callback', async () => {
        let installedPlugin = await Plugins.Installed.get(client, pluginId)
        expect(installedPlugin?.id).toBe(pluginId)
        expect(installedPlugin?.version).toBe('1.0.0')

        await new Promise(async (resolve) => {
          const result = await upgradePlugin(pluginId, {
            inline: false,
            onSuccess: () => {
              resolve(null)
              return Promise.resolve()
            }
          })

          expect(result).toBe(true)
        })

        installedPlugin = await Plugins.Installed.get(client, pluginId)
        expect(installedPlugin?.id).toBe(pluginId)
        expect(installedPlugin?.version).toBe('2.0.0')
      })
    })
  })
})
