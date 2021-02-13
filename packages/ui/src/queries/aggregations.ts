import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as Api from '@dataden/core/dist/api-types.esm'

import { getUri } from './common'

export function useCollections() {
  return useQuery(Api.Aggregations.GetCollections.path, async () => {
    return (
      await axios.get<Api.Aggregations.GetCollections.Response>(
        getUri(Api.Aggregations.GetCollections.path),
        {
          withCredentials: true
        }
      )
    ).data
  })
}

export function useAggregations() {
  return useQuery(Api.Aggregations.GetAggregations.path, async () => {
    return (
      await axios.get<Api.Aggregations.GetAggregations.Response>(
        getUri(Api.Aggregations.GetAggregations.path),
        {
          withCredentials: true
        }
      )
    ).data
  })
}

export function useAggregationUpsert() {
  const client = useQueryClient()

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
        client.invalidateQueries(Api.Aggregations.GetCollections.path)
        client.invalidateQueries(Api.Aggregations.GetAggregations.path)
      }
    }
  )
}

export function useAggregationRemoval() {
  const client = useQueryClient()

  return useMutation(
    async ({
      params
    }: {
      params: Api.Aggregations.DeleteAggregation.RouteParams
    }) => {
      return (
        await axios.delete(
          getUri(Api.Aggregations.DeleteAggregation.getPath(params)),

          { withCredentials: true }
        )
      ).data
    },
    {
      onSuccess: () => {
        client.invalidateQueries(Api.Aggregations.GetCollections.path)
        client.invalidateQueries(Api.Aggregations.GetAggregations.path)
      }
    }
  )
}
