import { MongoClient } from 'mongodb'
import { getClient, getClientMocked } from 'src/db/getClient'
import { Settings } from './Settings'
import type { Settings as ISettings } from './Settings'
import { DbPath } from './types'

describe('DB: Syncs', () => {
  let client: MongoClient
  const dbPath: DbPath = { pluginId: 'my-plugin', instanceName: 'my-instance' }

  beforeEach(async () => {
    client = await getClient()
    expect(getClientMocked).toBe(true)
  })

  afterEach(async () => {
    client = null
  })

  it('returns default settings values on first read', async () => {
    const settings = await Settings.get(client, dbPath)
    expect(settings).toEqual(null)
  })

  it('sets settings', async () => {
    const newSettings: ISettings = {
      plugin: {
        plugin: 'setting'
      },
      schedule: {
        every: 1,
        grain: 'hour'
      },
      secrets: {
        plugin: 'secret'
      }
    }

    await Settings.set(client, dbPath, newSettings)

    const settings = await Settings.get(client, dbPath)
    expect(settings).toEqual(newSettings)
  })
})
