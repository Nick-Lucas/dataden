import { Express } from 'express'
import _ from 'lodash'

import { authenticatedEndpoint } from './common'
import { Logger } from 'src/logging'
import * as Db from 'src/db'

import {
  DeleteAggregation,
  GetCollections,
  PutAggregation,
  Collection
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

  app.put<void, PutAggregation.Response, PutAggregation.Body>(
    PutAggregation.path,
    authenticatedEndpoint(),
    async (request, response) => {
      try {
        // TODO: allow an optional ID param so that the name can be changed
        const aggregation = request.body

        const client = await Db.getClient()

        // TODO: validate and clean  up all inputs
        // TODO: 400 if inputs not valid
        // TODO: sanitise and formalise aggregation name

        const collection = await client
          .db(Db.DATABASES.DATA)
          .createCollection(aggregation.name, {
            viewOn: aggregation.sources[0],
            pipeline: [
              ...aggregation.sources
                .slice(1)
                .map((source) => ({ $unionWith: source }))
            ]
          })

        response.status(201)
        response.send({
          name: collection.collectionName
        })
      } catch (e) {
        log.error(e)
        response.status(500)
        response.send(String(e) as any)
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

        response.sendStatus(200)
      } catch (e) {
        log.error(e)
        response.status(500)
        response.send(String(e) as any)
      }
    }
  )
}
