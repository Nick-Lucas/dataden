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
    client = null
  })

  it('returns default sync values on first read', async () => {
    const sync = await Syncs.last(client, dbPath)
    expect(sync).toEqual(_getDefaultSync())
  })

  it('sets a sync and returns', async () => {
    const newSync: Sync = makeSync(new Date())

    await Syncs.upsert(client, dbPath, newSync)

    const upsertedSync = await Syncs.last(client, dbPath)
    expect(upsertedSync).toEqual(newSync)
  })

  it('returns an empty list of all syncs', async () => {
    const syncs = await Syncs.list(client, dbPath)
    expect(syncs).toEqual([])
  })

  it('returns a sorted list of recent syncs', async () => {
    const now: number = Date.now()

    await Syncs.upsert(client, dbPath, makeSync(new Date(now + 3)))
    await Syncs.upsert(client, dbPath, makeSync(new Date(now + 1)))
    await Syncs.upsert(client, dbPath, makeSync(new Date(now + 2)))

    const syncs = await Syncs.list(client, dbPath)
    expect(syncs).toEqual([
      makeSync(new Date(now + 3)),
      makeSync(new Date(now + 2)),
      makeSync(new Date(now + 1))
    ])
  })

  it('upserts syncs using sync date as a key', async () => {
    const now: number = Date.now()

    const subjectSync = makeSync(new Date(now + 3))
    await Syncs.upsert(client, dbPath, subjectSync)
    await Syncs.upsert(client, dbPath, makeSync(new Date(now + 1)))
    await Syncs.upsert(client, dbPath, makeSync(new Date(now + 2)))

    subjectSync.items[0].syncInfo.rehydrationData.value = 'changed_value'
    await Syncs.upsert(client, dbPath, subjectSync)

    const syncs = await Syncs.list(client, dbPath)
    expect(syncs).toEqual([
      subjectSync,
      makeSync(new Date(now + 2)),
      makeSync(new Date(now + 1))
    ])
  })
})

function makeSync(date: Date): Sync {
  return {
    date: date.toISOString(),
    items: [
      {
        type: 'loader',
        name: 'loader_1',
        syncInfo: {
          success: true,
          rehydrationData: { value: date.toISOString() }
        }
      },
      {
        type: 'loader',
        name: 'loader_2',
        syncInfo: {
          success: false,
          error: 'loader failed',
          rehydrationData: { value: date.toISOString() }
        }
      }
    ]
  }
}
