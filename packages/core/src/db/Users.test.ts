import { MongoClient } from 'mongodb'
import { getClient, getClientMocked } from './getClient'
import {
  Users,
  User,
  hashPassword,
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD,
  DEFAULT_PASSWORD_HASH
} from './Users'

describe('DB: Syncs', () => {
  let client: MongoClient
  const username = DEFAULT_USERNAME

  beforeEach(async () => {
    client = await getClient()

    expect(getClientMocked).toBe(true)
  })

  afterEach(async () => {
    client = null
  })

  describe('blank database', () => {
    it('returns blank on first read', async () => {
      const user = await Users.get(client, username)
      expect(user).toEqual(null)
    })

    it('seeds admin user only once', async () => {
      const result = await Users.ensureDefaultUserSeeded(client)
      expect(result === 'seeded').toBe(true)

      const result2 = await Users.ensureDefaultUserSeeded(client)
      expect(result2 === 'ok').toBe(true)
    })
  })

  describe('pre-seeded user', () => {
    beforeEach(async () => {
      await Users.ensureDefaultUserSeeded(client)
    })

    it('returns the initially seeded admin user', async () => {
      const user = await Users.get(client, username)

      const expected: User = {
        username: username,
        resetRequired: true,
        passwordHash: DEFAULT_PASSWORD_HASH
      }
      expect(user).toEqual(expected)
    })

    it('resets the password of the initially seeded user', async () => {
      const user = await Users.get(client, username)

      const updatedUser: User = {
        ...user,
        passwordHash: hashPassword('newpassword')
      }
      await Users.upsert(client, updatedUser)

      const finalUser = await Users.get(client, username)
      const expected: User = {
        ...updatedUser,
        resetRequired: false
      }
      expect(finalUser).toEqual(expected)
    })

    it('validates the seeded user', async () => {
      const user = await Users.validate(client, username, DEFAULT_PASSWORD)

      const expected: User = {
        username: username,
        resetRequired: true,
        passwordHash: DEFAULT_PASSWORD_HASH
      }
      expect(user).toEqual(expected)
    })

    it('rejects an incorrect password', async () => {
      const user = await Users.validate(client, username, DEFAULT_PASSWORD_HASH)
      expect(user).toBe(false)
    })

    it('rejects a non-existing user', async () => {
      const user = await Users.validate(
        client,
        'random-username',
        DEFAULT_PASSWORD_HASH
      )
      expect(user).toBe(false)
    })
  })
})
