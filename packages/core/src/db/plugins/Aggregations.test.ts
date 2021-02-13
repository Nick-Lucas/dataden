import { MongoClient } from 'mongodb'
import { getClient, getClientMocked } from 'src/db/getClient'
import { getDataDbAggregationName } from './helpers'
import { Data, DataRow } from './Data'
import { DbPath } from './types'

import { Aggregation, Aggregations } from './Aggregations'

describe('DB: Aggregations', () => {
  let client: MongoClient
  // const aggregationOne: Aggre = 'my-dataset'

  beforeEach(async () => {
    client = await getClient()
    expect(getClientMocked).toBe(true)

    await Data.append(
      client,
      { pluginId: 'plugin', instanceName: 'instance' },
      'data1',
      [{ uniqueId: '1' }]
    )
    await Data.append(
      client,
      { pluginId: 'plugin', instanceName: 'instance' },
      'data2',
      [{ uniqueId: '2' }]
    )
  })

  afterEach(async () => {
    client = null
  })

  describe('blank slate', () => {
    it('should list nothing', async () => {
      const list = await Aggregations.list(client)

      expect(list).toEqual([])
    })

    it('should remove silently', async () => {
      const aggregationName = 'my-aggregation'

      await Aggregations.remove(client, aggregationName)
    })

    it('should create an aggregation', async () => {
      const aggregationName = 'my-aggregation'
      const aggregation: Aggregation = {
        name: aggregationName,
        sources: ['plugin__instance__data1', 'plugin__instance__data2']
      }

      await Aggregations.upsert(client, aggregationName, aggregation)
    })

    it('should fail to create an aggregation because a source is itself', async () => {
      const aggregationName = 'my-aggregation'
      const aggregation: Aggregation = {
        name: aggregationName,
        sources: [
          getDataDbAggregationName(aggregationName),
          'plugin__instance__data2'
        ]
      }

      await expect(
        Aggregations.upsert(client, aggregationName, aggregation)
      ).rejects.toEqual('consumes_itself')
    })

    it('should fail to create an aggregation because a source does not exist', async () => {
      const aggregationName = 'my-aggregation'
      const aggregation: Aggregation = {
        name: aggregationName,
        sources: ['plugin__instance__data1', 'plugin__instance__data3']
      }

      await expect(
        Aggregations.upsert(client, aggregationName, aggregation)
      ).rejects.toEqual('source_not_found')
    })
  })

  describe('existing aggregations', () => {
    const aggregationName = 'my-aggregation'
    const aggregation: Aggregation = {
      name: aggregationName,
      sources: ['plugin__instance__data1']
    }
    const other = {
      name: 'some-other',
      sources: ['plugin__instance__data1']
    }

    beforeEach(async () => {
      await Aggregations.upsert(client, aggregationName, aggregation)
      await Aggregations.upsert(client, other.name, other)
    })

    it('should list aggregations', async () => {
      const list = await Aggregations.list(client)
      expect(list).toEqual([aggregation, other])
    })

    it('should update the existing aggregation pipeline', async () => {
      const updated: Aggregation = {
        ...aggregation,
        sources: [...aggregation.sources, 'plugin__instance__data2']
      }

      await Aggregations.upsert(client, aggregationName, updated)

      const list = await Aggregations.list(client)
      expect(list).toEqual([updated, other])
    })

    it('should rename the existing aggregation pipeline', async () => {
      const updated: Aggregation = {
        ...aggregation,
        name: 'renamed-version'
      }

      await Aggregations.upsert(client, aggregationName, updated)

      const list = await Aggregations.list(client)
      expect(list).toEqual([updated, other])
    })
  })
})
