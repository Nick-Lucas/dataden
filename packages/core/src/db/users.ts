import { FilterQuery, MongoClient } from 'mongodb'

import { DATABASES, COLLECTIONS, PagingPosition, PagingResult } from './common'
import * as Sdk from '@dataden/sdk'
import { stripMongoId } from './stripMongoId'
import { createHash } from 'crypto'

// DTOS

export interface User {
  username: string
  passwordHash: string
  resetRequired: boolean
}

// Helers

export function hashPassword(plainText) {
  return createHash('sha256').update(plainText).digest('hex').toString()
}

const DEFAULT_USERNAME = 'admin'
const DEFAULT_PASSWORD_HASH = hashPassword('admin')

// Access

export const Users = {
  get: async (client: MongoClient, username) => {
    return await client
      .db(DATABASES.CORE)
      .collection(COLLECTIONS[DATABASES.CORE].USERS)
      .findOne<User>({ username: username })
  },

  upsert: async (client: MongoClient, update: User) => {
    const previous = await Users.get(client, update.username)

    const nextUser: User = {
      ...update,
      resetRequired: previous?.resetRequired ?? true
    }

    if (previous && previous.passwordHash !== update.passwordHash) {
      nextUser.resetRequired = false
    }

    return await client
      .db(DATABASES.CORE)
      .collection(COLLECTIONS[DATABASES.CORE].USERS)
      .updateOne(
        { username: nextUser.username },
        { $set: nextUser },
        { upsert: true }
      )
  },

  ensureDefaultUserSeeded: async (
    client: MongoClient
  ): Promise<'seeded' | 'ok'> => {
    const adminUser = await Users.get(client, DEFAULT_USERNAME)
    if (!adminUser) {
      await Users.upsert(client, {
        username: DEFAULT_USERNAME,
        passwordHash: DEFAULT_PASSWORD_HASH,
        resetRequired: true
      })

      return 'seeded'
    }

    return 'ok'
  },

  validate: async (
    client: MongoClient,
    username,
    password
  ): Promise<false | User> => {
    const user = await Users.get(client, username)
    if (!user) {
      return false
    }

    const hash = hashPassword(password)
    if (hash !== user.passwordHash) {
      return false
    }

    return user
  }
}
