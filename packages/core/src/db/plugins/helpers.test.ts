import { _getPluginId } from './helpers'

describe('Db: Helpers', () => {
  describe('_getPluginId', () => {
    it('should sanitise dirty string', () => {
      expect(
        _getPluginId({
          pluginId: 'my plugin.name1_______dirty',
          instanceName: 'test-instance__things'
        })
      ).toBe('my_plugin_name1_dirty__test_instance_things')
    })
  })
})
