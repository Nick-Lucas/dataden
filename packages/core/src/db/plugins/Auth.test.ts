import { MongoClient } from 'mongodb'
import { getClient, getClientMocked } from 'src/db/getClient'
import { Auth, AuthState } from './Auth'
import { DbPath } from './types'

describe('DB: Auth', () => {
  let client: MongoClient
  const dbPath: DbPath = { pluginId: 'my-plugin', instanceName: 'my-instance' }

  beforeEach(async () => {
    client = await getClient()

    expect(getClientMocked).toBe(true)
  })

  afterEach(async () => {
    client = null
  })

  it('returns default auth value on first read', async () => {
    const auth = await Auth.get(client, dbPath)
    expect(auth).toEqual(null)
  })

  it('sets auth and can load it again', async () => {
    const newAuth: AuthState = {
      some: 'arbitrary',
      auth: 'data'
    }

    await Auth.set(client, dbPath, newAuth)

    const auth = await Auth.get(client, dbPath)
    expect(auth).toEqual(newAuth)
  })

  it('resets auth after setting it', async () => {
    const newAuth: AuthState = {
      some: 'arbitrary',
      auth: 'data'
    }

    await Auth.set(client, dbPath, newAuth)
    await Auth.reset(client, dbPath)

    const auth = await Auth.get(client, dbPath)
    expect(auth).toEqual(null)
  })
})
