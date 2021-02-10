jest.mock('src/db/getClient')

import { PluginService } from 'src/lib/Scheduler'
import { DataLoader, PluginAuth, Settings } from '@dataden/sdk'
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
    const service = getPluginService({
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
    })

    await runLoaders(client, service, getSettings(), _getDefaultSync())

    const syncs = await getSyncs()
    const data = await getData()

    expect(syncs.length).toBe(1)
    expect(syncs[0].items.length).toBe(1)
    expect(syncs[0].items[0].name).toBe(dataSetName)
    expect(syncs[0].items[0].type).toBe('loader')
    expect(syncs[0].items[0].syncInfo.success).toBe(true)
    expect(syncs[0].items[0].syncInfo.rehydrationData).toEqual({ state: 'x' })

    expect(data).toEqual([
      { uniqueId: '1', value: 'a' },
      { uniqueId: '2', value: 'b' }
    ])
  })
})

function getPluginService(...loaders: DataLoader[]): PluginService {
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
        authMethod: noneAuth(),
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
