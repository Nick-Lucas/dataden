import { MongoClient } from 'mongodb'

import * as Sdk from '@dataden/sdk'

import { stripMongoId } from '../stripMongoId'
import { DbPath } from './types'
import { getPluginDbCollection } from './helpers'

export type AuthState = Sdk.PluginAuth.AuthState

// TODO: encrypt this data in the database
export const Auth = {
  get: async (client: MongoClient, path: DbPath): Promise<AuthState | null> => {
    const authState = await getPluginDbCollection(
      client,
      path,
      'auth'
    ).findOne<AuthState | null>({})

    if (authState) {
      return stripMongoId(authState)
    } else {
      return null
    }
  },

  set: async (
    client: MongoClient,
    path: DbPath,
    authState: AuthState
  ): Promise<void> => {
    await getPluginDbCollection(client, path, 'auth').updateOne(
      {},
      { $set: authState },
      { upsert: true }
    )
  },

  reset: async (client: MongoClient, path: DbPath): Promise<void> => {
    await getPluginDbCollection(client, path, 'auth').deleteOne({})
  }
}
