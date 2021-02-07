import { MongoClient } from 'mongodb'
import { getClient, getClientMocked } from 'src/db/getClient'
import { Sync, Syncs, _getDefaultSync } from './Syncs'
import { DbPath } from './types'

describe('DB: Syncs', () => {
  let client: MongoClient
  const dbPath: DbPath = { pluginId: 'my-plugin', instanceName: 'my-instance' }

  beforeEach(async () => {
    client = await getClient()

    expect(getClientMocked).toBe(true)
  })

  afterEach(async () => {
    await client.close(true)
    client = null
  })

  it('returns default sync values on first read', async () => {
    const sync = await Syncs.last(client, dbPath)
    expect(sync).toEqual(_getDefaultSync())
  })

  it('sets a sync and returns', async () => {
    const newSync: Sync = {
      date: new Date().toISOString(),
      items: [
        {
          type: 'loader',
          name: 'loader_1',
          syncInfo: {
            success: true,
            rehydrationData: { something: 1 }
          }
        },
        {
          type: 'loader',
          name: 'loader_2',
          syncInfo: {
            success: false,
            error: 'loader failed',
            rehydrationData: { something: 2 }
          }
        }
      ]
    }

    await Syncs.upsert(client, dbPath, newSync)

    const upsertedSync = await Syncs.last(client, dbPath)
    expect(upsertedSync).toEqual(newSync)
  })
})
