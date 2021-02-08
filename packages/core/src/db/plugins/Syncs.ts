import { MongoClient } from 'mongodb'

import * as Sdk from '@dataden/sdk'

import { DbPath } from './types'
import { getPluginDbCollection } from './helpers'
import { stripMongoId } from 'src/db/stripMongoId'

export type SyncItem = {
  type: 'loader'
  name: string
  syncInfo: Sdk.SyncInfo
}
export type Sync = {
  date: string
  items: SyncItem[]
}

export const _getDefaultSync = (): Sync => ({
  date: new Date(0).toISOString(),
  items: []
})

export const Syncs = {
  last: async (client: MongoClient, path: DbPath): Promise<Sync> => {
    const lastSync = await getPluginDbCollection(client, path, 'syncs').findOne<
      Sync
    >({}, { sort: { date: -1 } })

    if (lastSync) {
      return stripMongoId(lastSync)
    } else {
      return _getDefaultSync()
    }
  },

  upsert: async (
    client: MongoClient,
    path: DbPath,
    sync: Sync
  ): Promise<void> => {
    await getPluginDbCollection(client, path, 'syncs').updateOne(
      { date: sync.date },
      { $set: sync },
      { upsert: true }
    )
  }
}
