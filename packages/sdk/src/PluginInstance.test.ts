import { createPlugin } from './PluginInstance'

describe('createPlugin', () => {
  it('should define a basic plugin', async () => {
    const plugin = createPlugin({
      getDefaultSettings: async () => {
        return {
          name: 'MyPlugin',
          plugin: {},
          schedule: {
            every: 1,
            grain: 'minute'
          }
        }
      },
      loaders: {
        name: 'Dataset',
        load: async () => {
          return {
            lastDate: new Date(),
            data: [{ uniqueId: 1 }, { uniqueId: 2 }, { uniqueId: 3 }],
            mode: 'append'
          }
        }
      }
    })

    expect(plugin).toBeDefined()
    expect(Array.isArray(plugin.loaders)).toBe(true)
    expect(plugin.loaders.length).toBe(1)

    expect((await plugin.getDefaultSettings()).name).toBe('MyPlugin')
    expect(plugin.loaders[0].name).toBe('Dataset')
    expect(typeof plugin.loaders[0].load).toBe('function')
  })

  it('should define a basic plugin with multiple loaders', async () => {
    const plugin = createPlugin({
      getDefaultSettings: async () => {
        return {
          name: 'MyPlugin',
          plugin: {},
          schedule: {
            every: 1,
            grain: 'minute'
          }
        }
      },
      loaders: [
        {
          name: 'Dataset 1',
          load: async () => {
            return {
              lastDate: new Date(),
              data: [{ uniqueId: 1 }, { uniqueId: 2 }, { uniqueId: 3 }],
              mode: 'append'
            }
          }
        },
        {
          name: 'Dataset 2',
          load: async () => {
            return {
              lastDate: new Date(),
              data: [{ uniqueId: 4 }, { uniqueId: 5 }, { uniqueId: 6 }],
              mode: 'replace'
            }
          }
        }
      ]
    })

    expect(plugin).toBeDefined()
    expect(Array.isArray(plugin.loaders)).toBe(true)
    expect(plugin.loaders.length).toBe(2)

    expect((await plugin.getDefaultSettings()).name).toBe('MyPlugin')
    expect(plugin.loaders[0].name).toBe('Dataset 1')
    expect(typeof plugin.loaders[0].load).toBe('function')
    expect(plugin.loaders[1].name).toBe('Dataset 2')
    expect(typeof plugin.loaders[1].load).toBe('function')
  })

  it('should throw when no loaders are defined', async () => {
    function make(loaders) {
      createPlugin({
        getDefaultSettings: async () => {
          return {
            name: 'MyPlugin',
            plugin: {},
            schedule: {
              every: 1,
              grain: 'minute'
            }
          }
        },
        loaders
      })
    }

    expect(() => make(null)).toThrow()
    expect(() => make([])).toThrow()
  })
})
