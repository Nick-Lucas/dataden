jest.mock('src/db/getClient')

import { PluginService } from 'src/lib/Scheduler'
import { DataLoader, PluginAuth, Settings, SyncInfo } from '@dataden/sdk'
import { MongoClient } from 'mongodb'
import * as Db from 'src/db'
import { _getDefaultSync } from 'src/db/plugins'

import { runLoaders } from './runLoaders'

const path: Db.Plugins.DbPath = {
  pluginId: 'my-plugin',
  instanceName: 'my-instance'
}
const dataSetName = 'dataset'

describe('Run Loaders', () => {
  let client: MongoClient

  const setAuth = async () =>
    Db.Plugins.Auth.set(client, path, { auth: 'true' })
  const getSyncs = async () => Db.Plugins.Syncs.list(client, path)
  const getData = async () => {
    const page = await Db.Plugins.Data.fetch(
      client,
      path,
      dataSetName,
      { page: 0 },
      999
    )
    return page.data
  }

  beforeEach(async () => {
    client = await Db.getClient()
  })

  it('should run a simple loader', async () => {
    const service = getPluginService([
      {
        name: dataSetName,
        load: async (settings, request) => {
          return {
            mode: 'append',
            data: [
              { uniqueId: '1', value: 'a' },
              { uniqueId: '2', value: 'b' }
            ],
            syncInfo: { success: true, rehydrationData: { state: 'x' } }
          }
        }
      }
    ])

    await runLoaders(client, service, getSettings(), _getDefaultSync())

    expect(service.status === 'OK').toBe(true)

    const syncs = await getSyncs()
    expect(syncs.length).toBe(1)
    expect(syncs[0].items.length).toBe(1)
    expect(syncs[0].items[0].name).toBe(dataSetName)
    expect(syncs[0].items[0].type).toBe('loader')
    expect(syncs[0].items[0].syncInfo.success).toBe(true)
    expect(syncs[0].items[0].syncInfo.rehydrationData).toEqual({ state: 'x' })

    const data = await getData()
    expect(data).toEqual([
      { uniqueId: '1', value: 'a' },
      { uniqueId: '2', value: 'b' }
    ])
  })

  it('should handle a crashed sync', async () => {
    const service = getPluginService([
      {
        name: dataSetName,
        load: async (settings, request) => {
          throw 'OH MAN!'
        }
      }
    ])

    await runLoaders(client, service, getSettings(), _getDefaultSync())

    expect(service.status === 'OK').toBe(true)

    const syncs = await getSyncs()
    expect(syncs.length).toBe(1)
    expect(syncs[0].items.length).toBe(1)
    expect(syncs[0].items[0].name).toBe(dataSetName)
    expect(syncs[0].items[0].type).toBe('loader')
    expect(syncs[0].items[0].syncInfo).toEqual({
      success: false,
      error: 'OH MAN!',
      rehydrationData: {}
    } as SyncInfo)

    const data = await getData()
    expect(data).toEqual([])
  })

  it('should handle a crashed sync and copy over rehydration data from previous sync', async () => {
    const service = getPluginService([
      {
        name: dataSetName,
        load: async (settings, request) => {
          throw 'OH MAN!'
        }
      }
    ])

    const lastSync = _getDefaultSync()
    lastSync.items.push({
      name: dataSetName,
      type: 'loader',
      syncInfo: {
        success: true,
        rehydrationData: { data: 'y' }
      }
    })
    await runLoaders(client, service, getSettings(), lastSync)

    expect(service.status === 'OK').toBe(true)

    const syncs = await getSyncs()
    expect(syncs.length).toBe(1)
    expect(syncs[0].items.length).toBe(1)
    expect(syncs[0].items[0].name).toBe(dataSetName)
    expect(syncs[0].items[0].type).toBe('loader')
    expect(syncs[0].items[0].syncInfo).toEqual({
      success: false,
      error: 'OH MAN!',
      rehydrationData: { data: 'y' }
    } as SyncInfo)

    const data = await getData()
    expect(data).toEqual([])
  })

  describe('oauth2', () => {
    it('should refresh tokens', async () => {
      await setAuth()

      const auth = {
        type: 'oauth2_authorizationcode',
        getAuthUri: () => {
          throw 'not_implemented'
        },
        exchangeAuthorizationForAuthState: () => {
          throw 'not_implemented'
        },
        updateAuthState: async () => {
          return { auth: 'success' }
        }
      } as PluginAuth.AuthMethod

      const service = getPluginService(
        [
          {
            name: dataSetName,
            load: async (settings, request) => {
              return {
                mode: 'append',
                data: [
                  { uniqueId: '1', value: 'a' },
                  { uniqueId: '2', value: 'b' }
                ],
                syncInfo: { success: true, rehydrationData: { state: 'x' } }
              }
            }
          }
        ],
        auth
      )

      await runLoaders(client, service, getSettings(), _getDefaultSync())

      expect(service.status).toBe('OK')

      const syncs = await getSyncs()
      expect(syncs.length).toBe(1)
      expect(syncs[0].items.length).toBe(1)
      expect(syncs[0].items[0].name).toBe(dataSetName)
      expect(syncs[0].items[0].type).toBe('loader')
      expect(syncs[0].items[0].syncInfo.success).toBe(true)
      expect(syncs[0].items[0].syncInfo.rehydrationData).toEqual({ state: 'x' })

      const data = await getData()
      expect(data).toEqual([
        { uniqueId: '1', value: 'a' },
        { uniqueId: '2', value: 'b' }
      ])
    })

    it('should request reauthorization', async () => {
      await setAuth()

      const auth = {
        type: 'oauth2_authorizationcode',
        getAuthUri: () => {
          throw 'not_implemented'
        },
        exchangeAuthorizationForAuthState: () => {
          throw 'not_implemented'
        },
        updateAuthState: async () => {
          return 'reauthorization_required'
        }
      } as PluginAuth.AuthMethod

      const service = getPluginService(
        [
          {
            name: dataSetName,
            load: async (settings, request) => {
              return {
                mode: 'append',
                data: [
                  { uniqueId: '1', value: 'a' },
                  { uniqueId: '2', value: 'b' }
                ],
                syncInfo: { success: true, rehydrationData: { state: 'x' } }
              }
            }
          }
        ],
        auth
      )

      await runLoaders(client, service, getSettings(), _getDefaultSync())

      expect(service.status).toBe('Authentication Required')

      const syncs = await getSyncs()
      expect(syncs.length).toBe(1)
      expect(syncs[0].items.length).toBe(1)
      expect(syncs[0].items[0].name).toBe(dataSetName)
      expect(syncs[0].items[0].type).toBe('loader')
      expect(syncs[0].items[0].syncInfo).toEqual({
        success: false,
        error: 'Authentication Required',
        rehydrationData: {}
      } as SyncInfo)

      const data = await getData()
      expect(data).toEqual([])
    })

    it('should throw during reauthorization', async () => {
      await setAuth()

      const auth = {
        type: 'oauth2_authorizationcode',
        getAuthUri: () => {
          throw 'not_implemented'
        },
        exchangeAuthorizationForAuthState: () => {
          throw 'not_implemented'
        },
        updateAuthState: async () => {
          throw 'OH NO!'
        }
      } as PluginAuth.AuthMethod

      const service = getPluginService(
        [
          {
            name: dataSetName,
            load: async (settings, request) => {
              return {
                mode: 'append',
                data: [
                  { uniqueId: '1', value: 'a' },
                  { uniqueId: '2', value: 'b' }
                ],
                syncInfo: { success: true, rehydrationData: { state: 'x' } }
              }
            }
          }
        ],
        auth
      )

      await runLoaders(client, service, getSettings(), _getDefaultSync())

      expect(service.status).toBe('Error')

      const syncs = await getSyncs()
      expect(syncs.length).toBe(1)
      expect(syncs[0].items.length).toBe(1)
      expect(syncs[0].items[0].name).toBe(dataSetName)
      expect(syncs[0].items[0].type).toBe('loader')
      expect(syncs[0].items[0].syncInfo).toEqual({
        success: false,
        error: 'OH NO!',
        rehydrationData: {}
      } as SyncInfo)

      const data = await getData()
      expect(data).toEqual([])
    })
  })
})

function getPluginService(
  loaders: DataLoader[],
  auth: PluginAuth.AuthMethod = noneAuth()
): PluginService {
  return {
    status: 'OK',
    running: true,
    definition: {
      plugin: {
        id: path.pluginId,
        instances: [{ name: path.instanceName }],
        local: true,
        location: '',
        source: '',
        version: ''
      },
      service: {
        getDefaultSettings: () => null,
        authMethod: auth,
        loaders
      }
    },
    instance: { name: path.instanceName }
  }
}

function noneAuth(): PluginAuth.AuthMethod {
  return {
    type: 'none'
  }
}

function getSettings(): Settings {
  return {
    plugin: {},
    schedule: { every: 1, grain: 'hour' },
    secrets: {}
  }
}
