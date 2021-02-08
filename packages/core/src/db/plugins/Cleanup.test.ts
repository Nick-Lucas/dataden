import { MongoClient } from 'mongodb'
import { wipeDb } from 'src/db/__mocks__/getClient'
import { getClient, getClientMocked } from 'src/db/getClient'

import { DbPath } from './types'
import { Installed, Plugin } from './Installed'
import { Data, DataRow } from './Data'
import { Auth, AuthState } from './Auth'
import { Sync, Syncs, _getDefaultSync } from './Syncs'
import { Settings } from './Settings'
import { Cleanup } from './Cleanup'

describe('DB: Cleanup', () => {
  let client: MongoClient

  let pluginA: Plugin
  let pluginB: Plugin
  const pluginA_Instance_Default: DbPath = {
    pluginId: 'plugin-a',
    instanceName: 'default'
  }
  const pluginA_Instance_Custom: DbPath = {
    pluginId: 'plugin-a',
    instanceName: 'plugin-a.custom-instance'
  }
  const pluginB_Instance_Default: DbPath = {
    pluginId: 'plugin-b',
    instanceName: 'default'
  }
  const pluginB_Instance_Custom: DbPath = {
    pluginId: 'plugin-b',
    instanceName: 'plugin-b.custom-instance'
  }

  beforeEach(async () => {
    client = await getClient()
    await wipeDb()
    expect(getClientMocked).toBe(true)

    //
    // Set up pre-installed data
    pluginA = {
      id: pluginA_Instance_Default.pluginId,
      local: true,
      instances: [
        {
          name: pluginA_Instance_Default.instanceName
        },
        {
          name: pluginA_Instance_Custom.instanceName
        }
      ],
      location: 'location',
      source: 'source',
      version: '1.0'
    }
    pluginB = {
      id: pluginB_Instance_Default.pluginId,
      local: true,
      instances: [
        {
          name: pluginB_Instance_Default.instanceName
        },
        {
          name: pluginB_Instance_Custom.instanceName
        }
      ],
      location: 'location',
      source: 'source',
      version: '1.0'
    }

    // Install the plugins with loader configuration
    await Installed.upsert(client, pluginA)
    await Installed.upsert(client, pluginB)

    // Seed data in all collections
    await seedPluginData(client, pluginA_Instance_Default)
    await seedPluginData(client, pluginA_Instance_Custom)
    await seedPluginData(client, pluginB_Instance_Default)
    await seedPluginData(client, pluginB_Instance_Custom)
  })

  afterEach(async () => {
    client = null
  })

  // prettier-ignore
  it('removes an installed plugin', async () => {
    await Cleanup.removePlugin(client, pluginA_Instance_Default.pluginId)

    //
    // Verify syncs have been removed
    const defaultSync = _getDefaultSync()
    expect(await Syncs.last(client, pluginA_Instance_Default)).toEqual(defaultSync)
    expect(await Syncs.last(client, pluginA_Instance_Custom)).toEqual(defaultSync)
    expect(await Syncs.last(client, pluginB_Instance_Default)).not.toEqual(defaultSync)
    expect(await Syncs.last(client, pluginB_Instance_Custom)).not.toEqual(defaultSync)

    //
    // Verify data has been removed
    expect((await Data.fetch(client, pluginA_Instance_Default, 'dataset')).data.length).toBe(0)
    expect((await Data.fetch(client, pluginA_Instance_Custom, 'dataset')).data.length).toBe(0)
    expect((await Data.fetch(client, pluginB_Instance_Default, 'dataset')).data.length).toBe(1)
    expect((await Data.fetch(client, pluginB_Instance_Custom, 'dataset')).data.length).toBe(1)

    //
    // Verify Auth has been removed
    expect(await Auth.get(client, pluginA_Instance_Default)).toEqual(null)
    expect(await Auth.get(client, pluginA_Instance_Custom)).toEqual(null)
    expect(await Auth.get(client, pluginB_Instance_Default)).not.toEqual(null)
    expect(await Auth.get(client, pluginB_Instance_Custom)).not.toEqual(null)

    //
    // Verify Settings have been removed
    expect(await Settings.get(client, pluginA_Instance_Default)).toEqual(null)
    expect(await Settings.get(client, pluginA_Instance_Custom)).toEqual(null)
    expect(await Settings.get(client, pluginB_Instance_Default)).not.toEqual(null)
    expect(await Settings.get(client, pluginB_Instance_Custom)).not.toEqual(null)
  })

  // prettier-ignore
  it('removes an installed plugin instance', async () => {
    await Cleanup.removeInstance(client, pluginA_Instance_Custom)

    //
    // Verify syncs have been removed
    const defaultSync = _getDefaultSync()
    expect(await Syncs.last(client, pluginA_Instance_Default)).not.toEqual(defaultSync)
    expect(await Syncs.last(client, pluginA_Instance_Custom)).toEqual(defaultSync)
    expect(await Syncs.last(client, pluginB_Instance_Default)).not.toEqual(defaultSync)
    expect(await Syncs.last(client, pluginB_Instance_Custom)).not.toEqual(defaultSync)

    //
    // Verify data has been removed
    expect((await Data.fetch(client, pluginA_Instance_Default, 'dataset')).data.length).toBe(1)
    expect((await Data.fetch(client, pluginA_Instance_Custom, 'dataset')).data.length).toBe(0)
    expect((await Data.fetch(client, pluginB_Instance_Default, 'dataset')).data.length).toBe(1)
    expect((await Data.fetch(client, pluginB_Instance_Custom, 'dataset')).data.length).toBe(1)

    //
    // Verify Auth has been removed
    expect(await Auth.get(client, pluginA_Instance_Default)).not.toEqual(null)
    expect(await Auth.get(client, pluginA_Instance_Custom)).toEqual(null)
    expect(await Auth.get(client, pluginB_Instance_Default)).not.toEqual(null)
    expect(await Auth.get(client, pluginB_Instance_Custom)).not.toEqual(null)

    //
    // Verify Settings have been removed
    expect(await Settings.get(client, pluginA_Instance_Default)).not.toEqual(null)
    expect(await Settings.get(client, pluginA_Instance_Custom)).toEqual(null)
    expect(await Settings.get(client, pluginB_Instance_Default)).not.toEqual(null)
    expect(await Settings.get(client, pluginB_Instance_Custom)).not.toEqual(null)
  })
})

async function seedPluginData(client: MongoClient, path: DbPath) {
  // Add a sync for each
  const sync: Sync = {
    date: new Date().toISOString(),
    items: [
      {
        name: 'dataset',
        type: 'loader',
        syncInfo: { success: true, rehydrationData: {} }
      }
    ]
  }
  await Syncs.upsert(client, path, sync)
  expect(await Syncs.last(client, path)).toEqual(sync)

  // Add an auth entry for each
  const auth: AuthState = {
    key: path.pluginId
  }
  await Auth.set(client, path, auth)
  expect(await Auth.get(client, path)).toEqual(auth)

  // Add Settings for each
  const settings: Settings = {
    plugin: {},
    schedule: { every: 1, grain: 'day' },
    secrets: {}
  }
  await Settings.set(client, path, settings)
  expect(await Settings.get(client, path)).toEqual(settings)

  // Append 1 row of data for each plugin
  const dataRows: DataRow[] = [
    {
      uniqueId: path.pluginId + '__' + path.instanceName
    }
  ]
  await Data.append(client, path, 'dataset', dataRows)
  expect((await Data.fetch(client, path, 'dataset')).data).toEqual(dataRows)
}
