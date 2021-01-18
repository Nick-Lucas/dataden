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

export function usePluginAuthInteractionResult() {
  const client = useQueryClient()

  return useMutation(
    async function ({
      params,
      result
    }: {
      params: Api.PluginAuth.PostPluginAuthInteractionResult.RouteParams
      result: Omit<
        Api.PluginAuth.PostPluginAuthInteractionResult.Body,
        'redirectUri'
      >
    }) {
      try {
        return await axios.post(
          Api.PluginAuth.PostPluginAuthInteractionResult.getPath(params),
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
      onSuccess: (data, { params }) => {
        client.invalidateQueries(
          Api.PluginAuth.PostPluginAuthInteraction.getPath(params)
        )
      }
    }
  )
}
