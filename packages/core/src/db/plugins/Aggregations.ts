import { MongoClient, Collection, CollectionCreateOptions } from 'mongodb'

import { COLLECTIONS, DATABASES } from '../common'
import { stripMongoId } from '../stripMongoId'
import { DbPath } from './types'
import {
  getDataDb,
  getDataDbAggregationName,
  getDataDbAggregation
} from './helpers'

import { getScoped } from 'src/logging'
const log = getScoped('Db:Aggregations')

export interface Aggregation {
  name: string
  sources: string[]
}

function getAggregationRegistry(client: MongoClient) {
  return client
    .db(DATABASES.CORE)
    .collection<Aggregation>(COLLECTIONS[DATABASES.CORE].AGGREGATIONS)
}

export const Aggregations = {
  list: async function (client: MongoClient): Promise<Aggregation[]> {
    const list = await getAggregationRegistry(client).find().toArray()
    return list.map((item) => stripMongoId(item))
  },

  upsert: async function (
    client: MongoClient,
    aggregationName: string,
    aggregation: Aggregation
  ): Promise<Collection> {
    log.info(`Will create/update ${aggregationName}`)

    const aggregationCollectionName = getDataDbAggregationName(aggregationName)

    //
    // Validate

    const dataDb = getDataDb(client)
    const allDataCollections = await dataDb.collections()

    if (aggregation.sources.includes(aggregationCollectionName)) {
      throw 'consumes_itself'
    }

    for (const source of aggregation.sources) {
      const sourceCollection = allDataCollections.find(
        (c) => c.collectionName === source
      )
      if (!sourceCollection) {
        throw 'source_not_found'
      }
    }

    //
    // Do upsert

    const aggregationsRegistry = getAggregationRegistry(client)
    await aggregationsRegistry.updateOne(
      {
        name: aggregationName
      },
      {
        $set: aggregation
      },
      {
        upsert: true
      }
    )

    try {
      const existing = await getDataDbAggregation(client, aggregation.name)
      if (existing !== null) {
        log.info(`Replacing existing aggregation pipeline`)
        await existing.drop()
      }
    } catch (e) {}

    log.info(`Creating aggregation pipeline`)
    const collection = await getDataDb(client).createCollection(
      getDataDbAggregationName(aggregation.name),
      transformAggregationToMongoPipeline(aggregation)
    )

    log.info(`OK`)

    return stripMongoId(collection)
  },

  remove: async function (client: MongoClient, aggregationName: string) {
    log.info(`Removing aggregation pipeline ${aggregationName}`)

    try {
      const existing = await getDataDbAggregation(client, aggregationName)
      if (existing !== null) {
        await existing.drop()
      }
    } catch (e) {}

    const aggregationsRegistry = getAggregationRegistry(client)
    await aggregationsRegistry.deleteOne({
      name: aggregationName
    })

    log.info(`OK`)
  }
}

function transformAggregationToMongoPipeline(
  aggregation: Aggregation
): CollectionCreateOptions {
  return {
    viewOn: aggregation.sources[0],
    pipeline: [
      ...aggregation.sources.slice(1).map((source) => ({ $unionWith: source }))
    ]
  }
}
