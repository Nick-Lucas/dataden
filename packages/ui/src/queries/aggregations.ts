import axios from 'axios'
import { useMutation, useQuery } from 'react-query'
import * as Api from '@dataden/core/dist/api-types.esm'

import { getUri } from './common'

export function useCollections() {
  return useQuery(
    Api.Aggregations.GetCollections.path,
    async () => {
      return (
        await axios.get<Api.Aggregations.GetCollections.Response>(
          getUri(Api.Aggregations.GetCollections.path),
          {
            withCredentials: true
          }
        )
      ).data
    },
    {
      refetchInterval: 10000
    }
  )
}

export function useAggregationUpsert() {
  return useMutation(
    async ({ body }: { body: Api.Aggregations.PutAggregation.Body }) => {
      return (
        await axios.put<Api.Aggregations.PutAggregation.Response>(
          getUri(Api.Aggregations.PutAggregation.path),
          body,
          { withCredentials: true }
        )
      ).data
    },
    {
      onSuccess: () => {
        // TODO: reset aggregations list
      }
    }
  )
}
