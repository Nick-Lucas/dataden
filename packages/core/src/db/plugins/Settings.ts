import { MongoClient } from 'mongodb'

import * as Sdk from '@dataden/sdk'

import { stripMongoId } from '../stripMongoId'
import { DbPath } from './types'
import { getPluginDbCollection } from './helpers'

export type Settings = Sdk.Settings

export const Settings = {
  get: async (client: MongoClient, path: DbPath): Promise<Settings | null> => {
    const settings = await getPluginDbCollection(
      client,
      path,
      'settings'
    ).findOne<Settings | null>({})

    if (settings) {
      return stripMongoId(settings)
    } else {
      return null
    }
  },

  set: async (
    client: MongoClient,
    path: DbPath,
    settings: Settings
  ): Promise<void> => {
    await getPluginDbCollection(client, path, 'settings').updateOne(
      {},
      { $set: stripMongoId(settings) },
      { upsert: true }
    )
  }
}
