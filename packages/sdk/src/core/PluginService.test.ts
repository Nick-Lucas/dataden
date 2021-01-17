import { createPlugin } from './PluginService'

describe('createPlugin', () => {
  it('should define a basic plugin', async () => {
    const plugin = createPlugin({
      getDefaultSettings: async () => {
        return {
          plugin: {},
          schedule: {
            every: 1,
            grain: 'minute'
          },
          secrets: {}
        }
      },
      loaders: {
        name: 'Dataset',
        load: async () => {
          return {
            syncInfo: {
              success: true,
              rehydrationData: {}
            },
            data: [{ uniqueId: '1' }, { uniqueId: '2' }, { uniqueId: '3' }],
            mode: 'append'
          }
        }
      }
    })

    expect(plugin).toBeDefined()
    expect(Array.isArray(plugin.loaders)).toBe(true)
    expect(plugin.loaders.length).toBe(1)

    expect(plugin.loaders[0].name).toBe('Dataset')
    expect(typeof plugin.loaders[0].load).toBe('function')
  })

  it('should define a basic plugin with multiple loaders', async () => {
    const plugin = createPlugin({
      getDefaultSettings: async () => {
        return {
          plugin: {},
          schedule: {
            every: 1,
            grain: 'minute'
          },
          secrets: {}
        }
      },
      loaders: [
        {
          name: 'Dataset_1',
          load: async () => {
            return {
              syncInfo: { success: true, rehydrationData: {} },
              data: [{ uniqueId: '1' }, { uniqueId: '2' }, { uniqueId: '3' }],
              mode: 'append'
            }
          }
        },
        {
          name: 'Dataset_2',
          load: async () => {
            return {
              syncInfo: { success: true, rehydrationData: {} },
              data: [{ uniqueId: '4' }, { uniqueId: '5' }, { uniqueId: '6' }],
              mode: 'replace'
            }
          }
        }
      ]
    })

    expect(plugin).toBeDefined()
    expect(Array.isArray(plugin.loaders)).toBe(true)
    expect(plugin.loaders.length).toBe(2)

    expect(plugin.loaders[0].name).toBe('Dataset_1')
    expect(typeof plugin.loaders[0].load).toBe('function')
    expect(plugin.loaders[1].name).toBe('Dataset_2')
    expect(typeof plugin.loaders[1].load).toBe('function')
  })

  it('should throw when no loaders are defined', async () => {
    function make(loaders) {
      createPlugin({
        getDefaultSettings: async () => {
          return {
            plugin: {},
            schedule: {
              every: 1,
              grain: 'minute'
            },
            secrets: {}
          }
        },
        loaders
      })
    }

    expect(() => make(null)).toThrow('DataLoader was not provided')
    expect(() => make([])).toThrow('DataLoader was not provided')
  })

  it('should throw when loader name is invalid', async () => {
    function make() {
      createPlugin({
        getDefaultSettings: async () => {
          return {
            plugin: {},
            schedule: {
              every: 1,
              grain: 'minute'
            },
            secrets: {}
          }
        },
        loaders: {
          name: 'Invalid 1',
          load: null
        }
      })
    }

    expect(make).toThrow('DataLoader name is invalid')
  })
})
