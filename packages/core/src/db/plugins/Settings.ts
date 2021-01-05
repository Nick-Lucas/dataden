import { MongoClient } from 'mongodb'

import * as Sdk from '@dataden/sdk'

import { stripMongoId } from '../stripMongoId'
import { DbPath } from './types'
import { getPluginDb } from './helpers'

export type Settings = Sdk.Settings

export const Settings = {
  get: async (client: MongoClient, path: DbPath): Promise<Settings | null> => {
    const settings = await getPluginDb(
      client,
      path,
      'settings'
    ).findOne<Settings | null>({})

    if (settings) {
      return settings
    } else {
      return null
    }
  },

  set: async (
    client: MongoClient,
    path: DbPath,
    settings: Settings
  ): Promise<void> => {
    await getPluginDb(client, path, 'settings').updateOne(
      {},
      { $set: stripMongoId(settings) },
      { upsert: true }
    )
  }
}
