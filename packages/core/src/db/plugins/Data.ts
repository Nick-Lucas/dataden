import { MongoClient } from 'mongodb'

import * as Sdk from '@dataden/sdk'

import { PagingPosition, PagingResult } from '../common'
import { stripMongoId } from '../stripMongoId'
import { DbPath } from './types'
import { getDataDbCollection } from './helpers'

import { getScoped } from 'src/logging'

export type DataRow = Sdk.DataRow

export const Data = {
  append: async function (
    client: MongoClient,
    path: DbPath,
    dataSetName: string,
    rows: DataRow[]
  ): Promise<void> {
    if (!rows || rows.length === 0) {
      return
    }

    const log = getScoped(
      `DB ${path.pluginId}->${path.instanceName}->${dataSetName}`
    )

    log.info(`Upserting ${rows.length} rows`)

    const result = await getDataDbCollection(
      client,
      path,
      dataSetName
    ).bulkWrite(
      rows.map((row) => {
        return {
          updateOne: {
            filter: { uniqueId: row.uniqueId },
            update: { $set: row },
            upsert: true
          }
        }
      })
    )

    log.info(`Total upserted: ${result.upsertedCount}`)

    return
  },

  replace: async function (
    client: MongoClient,
    path: DbPath,
    dataSetName: string,
    rows: DataRow[]
  ): Promise<void> {
    await getDataDbCollection(client, path, dataSetName).deleteMany({})
    await Data.append(client, path, dataSetName, rows)
  },

  fetch: async function (
    client: MongoClient,
    path: DbPath,
    dataSetName: string,
    position: PagingPosition = { page: 0 },
    pageSize = 1000
  ): Promise<PagingResult<DataRow>> {
    const cursor = await getDataDbCollection(client, path, dataSetName).find<
      DataRow
    >({})

    const totalRows = await cursor.count(false)
    const pages = totalRows === 0 ? 1 : Math.ceil(totalRows / pageSize)
    const rows = await cursor
      .skip(pageSize * position.page)
      .limit(pageSize)
      .toArray()

    return {
      page: position.page,
      pages: pages,
      data: rows.map(stripMongoId)
    }
  }
}
