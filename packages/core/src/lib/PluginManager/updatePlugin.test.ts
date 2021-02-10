jest.mock('./getInstallationManager')
jest.mock('./uninstallPlugin.ts')

import { getClient, Plugins } from 'src/db'

import { updatePlugin } from './updatePlugin'
import { MongoClient } from 'mongodb'

const uninstallPluginMock = jest.requireMock('./uninstallPlugin.ts')

describe('PluginManager', () => {
  describe('updatePlugin', () => {
    let client: MongoClient
    const pluginId = 'my-plugin'
    let plugin: Plugins.Plugin

    beforeEach(async () => {
      client = await getClient()
      jest.resetAllMocks()

      plugin = {
        id: pluginId,
        instances: [
          { name: 'instance-1' },
          { name: 'instance-2' },
          { name: 'instance-3' }
        ],
        local: true,
        location: pluginId,
        source: pluginId,
        version: '1.0.0'
      }
      await Plugins.Installed.upsert(client, plugin)
    })
    it('should update plugin and reconcile instances', async () => {
      const updatedPlugin = {
        ...plugin,
        instances: plugin.instances.filter((i) => i.name === 'instance-2')
      }

      await updatePlugin(client, updatedPlugin)

      expect(await Plugins.Installed.get(client, plugin.id)).toEqual(
        updatedPlugin
      )
      expect(uninstallPluginMock.uninstallInstance.mock.calls).toEqual([
        [plugin.id, 'instance-1'],
        [plugin.id, 'instance-3']
      ])
    })
  })
})
