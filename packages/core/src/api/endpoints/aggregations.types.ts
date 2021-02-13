import * as Db from 'src/db'

export interface AggregationParams {
  name: string
}

export type Aggregation = Db.Plugins.Aggregation

export interface Collection {
  name: string
}

export namespace GetCollections {
  export const path = '/v1.0/collections'

  export type Response = Collection[]
}

export namespace GetAggregations {
  export const path = '/v1.0/aggregations'

  export type Response = Aggregation[]
}

export namespace PutAggregation {
  export const path = '/v1.0/aggregations'

  export type Body = {
    name: string
    sources: string[]
  }

  export type Response = Collection
}

export namespace DeleteAggregation {
  export const path = '/v1.0/aggregations/:name'
  export const getPath = (params: RouteParams) =>
    '/v1.0/aggregations/' + encodeURIComponent(params.name)

  export type RouteParams = AggregationParams
}
