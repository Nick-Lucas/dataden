import { FilterQuery, MongoClient } from 'mongodb'

import * as Sdk from '@dataden/sdk'

import { DbPath } from './types'
import { getPluginDb } from './helpers'

export type Sync = Sdk.SyncInfo

export const Syncs = {
  last: async (
    client: MongoClient,
    path: DbPath,
    query: FilterQuery<Sync> = {}
  ): Promise<Sync> => {
    const lastSync = await getPluginDb(
      client,
      path,
      'syncs'
    ).findOne<Sync | null>(query, { sort: { date: -1 } })

    if (lastSync) {
      return lastSync
    } else {
      return {
        success: true,
        date: null,
        latestDate: null
      }
    }
  },

  track: async (
    client: MongoClient,
    path: DbPath,
    sync: Sync
  ): Promise<void> => {
    await getPluginDb(client, path, 'syncs').insertOne(sync)
  }
}
