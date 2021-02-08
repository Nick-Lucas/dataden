import { MongoClient } from 'mongodb'
import { wipeDb } from 'src/db/__mocks__/getClient'
import { getClient, getClientMocked } from 'src/db/getClient'
import { PagingResult } from '../common'
import { Data, DataRow } from './Data'
import { DbPath } from './types'

describe('DB: Data', () => {
  let client: MongoClient
  const dbPath: DbPath = { pluginId: 'my-plugin', instanceName: 'my-instance' }
  const datasetName = 'my-dataset'

  beforeEach(async () => {
    client = await getClient()
    await wipeDb()

    expect(getClientMocked).toBe(true)
  })

  afterEach(async () => {
    client = null
  })

  describe('blank slate', () => {
    it('returns default auth value on first read', async () => {
      const data = await Data.fetch(
        client,
        dbPath,
        datasetName,
        { page: 0 },
        100
      )

      const expected: PagingResult<DataRow> = {
        data: [],
        page: 0,
        pages: 1
      }
      expect(data).toEqual(expected)
    })

    it('inserts a single item', async () => {
      const newRow: DataRow = {
        uniqueId: 'one',
        arbitrary: 'data'
      }
      await Data.append(client, dbPath, datasetName, [newRow])

      const data = await Data.fetch(
        client,
        dbPath,
        datasetName,
        { page: 0 },
        100
      )

      const expected: PagingResult<DataRow> = {
        data: [newRow],
        page: 0,
        pages: 1
      }
      expect(data).toEqual(expected)
    })

    it('replaces a single item', async () => {
      const newRow: DataRow = {
        uniqueId: 'one',
        arbitrary: 'data'
      }
      await Data.replace(client, dbPath, datasetName, [newRow])

      const data = await Data.fetch(
        client,
        dbPath,
        datasetName,
        { page: 0 },
        100
      )

      const expected: PagingResult<DataRow> = {
        data: [newRow],
        page: 0,
        pages: 1
      }
      expect(data).toEqual(expected)
    })
  })

  describe('pre-existing data', () => {
    let row1: DataRow = null
    let row2: DataRow = null
    beforeEach(async () => {
      row1 = {
        uniqueId: 'one',
        arbitrary: 'data'
      }
      row2 = {
        uniqueId: 'two',
        arbitrary: 'keys'
      }

      await Data.append(client, dbPath, datasetName, [row1, row2])
    })

    it('append overwrites matching rows and inserts new rows', async () => {
      const row2Mod: DataRow = {
        ...row2,
        arbitrary: 'overwrite',
        overwritten: true
      }
      const row3: DataRow = { uniqueId: 'three', overwritten: false }

      await Data.append(client, dbPath, datasetName, [row2Mod, row3])

      const page = await Data.fetch(
        client,
        dbPath,
        datasetName,
        { page: 0 },
        100
      )

      const expected: PagingResult<DataRow> = {
        data: [row1, row2Mod, row3],
        page: 0,
        pages: 1
      }
      expect(page).toEqual(expected)
    })

    it('replace overwrites all rows', async () => {
      const row2Mod: DataRow = {
        ...row2,
        arbitrary: 'overwrite',
        overwritten: true
      }
      const row3: DataRow = { uniqueId: 'three', overwritten: false }

      await Data.replace(client, dbPath, datasetName, [row2Mod, row3])

      const page = await Data.fetch(
        client,
        dbPath,
        datasetName,
        { page: 0 },
        100
      )

      const expected: PagingResult<DataRow> = {
        data: [row2Mod, row3],
        page: 0,
        pages: 1
      }
      expect(page).toEqual(expected)
    })
  })
})
