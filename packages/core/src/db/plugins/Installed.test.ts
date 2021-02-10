import { MongoClient } from 'mongodb'
import { getClient, getClientMocked } from 'src/db/getClient'
import { Installed, Plugin } from './Installed'

describe('DB: Installed', () => {
  let client: MongoClient
  const pluginId = 'my-plugin'

  beforeEach(async () => {
    client = await getClient()
    expect(getClientMocked).toBe(true)
  })

  afterEach(async () => {
    client = null
  })

  it('returns empty list when no plugins installed', async () => {
    const list = await Installed.list(client)
    expect(list).toEqual([])
  })

  it('returns null when plugin is not installed', async () => {
    const plugin = await Installed.get(client, pluginId)
    expect(plugin).toEqual(null)
  })

  it('installs a plugin', async () => {
    const newPlugin: Plugin = {
      id: pluginId,
      local: true,
      instances: [
        {
          name: 'instance-one'
        }
      ],
      location: 'location',
      source: 'source',
      version: '1.0'
    }

    await Installed.upsert(client, newPlugin)

    const plugin = await Installed.get(client, pluginId)
    expect(plugin).toEqual(newPlugin)

    const list = await Installed.list(client)
    expect(list).toEqual([newPlugin])
  })

  it('updates an installed plugin', async () => {
    const newPlugin: Plugin = {
      id: pluginId,
      local: true,
      instances: [
        {
          name: 'instance-one'
        }
      ],
      location: 'location',
      source: 'source',
      version: '1.0'
    }

    // Insert and check plugin
    await Installed.upsert(client, newPlugin)
    let plugin = await Installed.get(client, pluginId)
    expect(plugin).toEqual(newPlugin)

    // Update plugin
    const updatedPlugin: Plugin = {
      ...newPlugin,
      version: '2.0'
    }
    await Installed.upsert(client, updatedPlugin)

    // Assert updated
    plugin = await Installed.get(client, pluginId)
    expect(plugin).toEqual(updatedPlugin)
  })

  it('removes an installed plugin', async () => {
    const newPlugin: Plugin = {
      id: pluginId,
      local: true,
      instances: [
        {
          name: 'instance-one'
        }
      ],
      location: 'location',
      source: 'source',
      version: '1.0'
    }

    // Insert and check plugin
    await Installed.upsert(client, newPlugin)
    let plugin = await Installed.get(client, pluginId)
    expect(plugin).toEqual(newPlugin)

    // Remove
    await Installed.remove(client, pluginId)

    // Check removed
    plugin = await Installed.get(client, pluginId)
    expect(plugin).toBe(null)
  })
})
