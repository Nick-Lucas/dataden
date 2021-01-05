import { MongoClient } from 'mongodb'

import * as Sdk from '@dataden/sdk'

import { PagingPosition, PagingResult } from '../common'
import { DbPath } from './types'
import { getPluginDb } from './helpers'

export type DataRow = Sdk.DataRow

export const Data = {
  append: async function (
    client: MongoClient,
    path: DbPath,
    dataSetName: string,
    rows: DataRow[]
  ): Promise<void> {
    await getPluginDb(client, path, 'data_' + dataSetName).insertMany(rows, {
      ordered: true
    })
  },

  replace: async function (
    client: MongoClient,
    path: DbPath,
    dataSetName: string,
    rows: DataRow[]
  ): Promise<void> {
    await getPluginDb(client, path, 'data_' + dataSetName).deleteMany({})
    await Data.append(client, path, dataSetName, rows)
  },

  fetch: async function (
    client: MongoClient,
    path: DbPath,
    dataSetName: string,
    position: PagingPosition = { page: 0 },
    pageSize = 1000
  ): Promise<PagingResult<DataRow>> {
    const cursor = await getPluginDb(client, path, 'data_' + dataSetName).find<
      DataRow
    >({})

    const totalRows = await cursor.count(false)
    const pages = Math.ceil(totalRows / pageSize)
    const rows = await cursor
      .skip(pageSize * position.page)
      .limit(pageSize)
      .toArray()

    return {
      page: position.page,
      pages: pages,
      data: rows
    }
  }
}
