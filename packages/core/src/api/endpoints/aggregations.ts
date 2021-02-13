import { Express } from 'express'
import _ from 'lodash'

import { authenticatedEndpoint } from './common'
import { Logger } from 'src/logging'
import * as Db from 'src/db'

import {
  DeleteAggregation,
  GetCollections,
  PutAggregation,
  Collection,
  GetAggregations
} from './aggregations.types'

export function listen(app: Express, log: Logger) {
  app.get<void, GetCollections.Response, void, void>(
    GetCollections.path,
    authenticatedEndpoint(),
    async (request, response) => {
      try {
        const client = await Db.getClient()

        const allCollections = await client.db(Db.DATABASES.DATA).collections()
        const collections = _(allCollections)
          .map<Collection>((c) => {
            return {
              name: c.collectionName
            }
          })
          .sortBy((c) => c.name)
          .value()

        response.send(collections)
      } catch (e) {
        log.error(e)
        response.status(500)
        response.send(String(e) as any)
      }
    }
  )

  app.get<void, GetAggregations.Response, void, void>(
    GetAggregations.path,
    authenticatedEndpoint(),
    async (request, response) => {
      try {
        const client = await Db.getClient()

        const aggregations = await Db.Plugins.Aggregations.list(client)

        response.send(aggregations)
      } catch (e) {
        log.error(e)
        response.status(500)
        response.send(String(e) as any)
      }
    }
  )

  app.put<void, PutAggregation.Response, PutAggregation.Body>(
    PutAggregation.path,
    authenticatedEndpoint(),
    async (request, response) => {
      try {
        // TODO: allow an optional ID param so that the name can be changed
        const aggregation = request.body

        const client = await Db.getClient()

        const aggegration = await Db.Plugins.Aggregations.upsert(
          client,
          aggregation.name,
          aggregation
        )

        response.status(201)
        response.send(aggegration)
      } catch (e) {
        if (e === 'consumes_itself') {
          response.status(400)
          response.send(
            'The aggregation cannot consume itself as a source' as any
          )
        } else if (e === 'source_not_found') {
          response.status(400)
          response.send(
            'The aggregation consumes a source collection which does not exist' as any
          )
        } else {
          log.error(e)
          response.status(500)
          response.send(String(e) as any)
        }
      }
    }
  )

  app.delete<DeleteAggregation.RouteParams>(
    DeleteAggregation.path,
    authenticatedEndpoint(),
    async (request, response) => {
      try {
        const { name } = request.params
        if (!name) {
          response.sendStatus(400)
          return
        }

        const client = await Db.getClient()

        await Db.Plugins.Aggregations.remove(client, name)

        response.sendStatus(200)
      } catch (e) {
        log.error(e)
        response.status(500)
        response.send(String(e) as any)
      }
    }
  )
}
