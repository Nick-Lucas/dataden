import { MongoClient } from 'mongodb'

import * as Sdk from '@dataden/sdk'

import { DbPath } from './types'
import { getPluginDb } from './helpers'

export type SyncItem = {
  type: 'loader'
  name: string
  syncInfo: Sdk.SyncInfo
}
export type Sync = {
  date: string
  items: SyncItem[]
}

export const Syncs = {
  last: async (client: MongoClient, path: DbPath): Promise<Sync> => {
    const lastSync = await getPluginDb(client, path, 'syncs').findOne<Sync>(
      {},
      { sort: { date: -1 } }
    )

    if (lastSync) {
      return lastSync
    } else {
      return {
        date: new Date(0).toISOString(),
        items: []
      }
    }
  },

  upsert: async (
    client: MongoClient,
    path: DbPath,
    sync: Sync
  ): Promise<void> => {
    await getPluginDb(client, path, 'syncs').updateOne(
      { date: sync.date },
      { $set: sync },
      { upsert: true }
    )
  }
}
