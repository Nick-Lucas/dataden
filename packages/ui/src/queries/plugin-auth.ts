import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as Api from '@dataden/core/dist/api-types.esm'

import { getUri } from './common'

const redirectUri = window.location.origin + '/oauth2'

export function usePluginAuthInteraction(
  params: Api.PluginAuth.PostPluginAuthInteraction.RouteParams
) {
  return useQuery(
    Api.PluginAuth.PostPluginAuthInteraction.getPath(params),
    async () => {
      const result = await axios.post<
        Api.PluginAuth.PostPluginAuthInteraction.Response
      >(
        getUri(Api.PluginAuth.PostPluginAuthInteraction.getPath(params)),
        { redirectUri } as Api.PluginAuth.PostPluginAuthInteraction.Body,
        {
          withCredentials: true
        }
      )

      return result.data
    }
  )
}

export function usePluginAuthReset() {
  const client = useQueryClient()

  return useMutation(
    async function (params: Api.PluginAuth.DeletePluginAuth.RouteParams) {
      try {
        return await axios.delete(
          Api.PluginAuth.DeletePluginAuth.getPath(params),
          {
            withCredentials: true
          }
        )
      } catch (e) {
        if (e.response) {
          // eslint-disable-next-line no-throw-literal
          throw `The service returned an error: "${e.response.data}"`
        } else {
          throw e
        }
      }
    },
    {
      onSuccess: () => {
        // Wide reaching, so just reset everything
        client.invalidateQueries()
      }
    }
  )
}

export function usePluginAuthInteractionResult() {
  const client = useQueryClient()

  return useMutation(
    async function ({
      params,
      result
    }: {
      params: Api.PluginAuth.PostPluginAuth.RouteParams
      result: Omit<Api.PluginAuth.PostPluginAuth.Body, 'redirectUri'>
    }) {
      try {
        return await axios.post(
          Api.PluginAuth.PostPluginAuth.getPath(params),
          {
            ...result,
            redirectUri
          },
          {
            withCredentials: true
          }
        )
      } catch (e) {
        if (e.response) {
          // eslint-disable-next-line no-throw-literal
          throw `The service returned an error: "${e.response.data}"`
        } else {
          throw e
        }
      }
    },
    {
      onSuccess: () => {
        // Wide reaching, so just reset everything
        client.invalidateQueries()
      }
    }
  )
}
