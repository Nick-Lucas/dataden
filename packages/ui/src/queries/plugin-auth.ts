import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as Api from '@dataden/core/dist/api-types'

import { getUri } from './common'

export function usePluginAuthInteraction({ pluginId }: { pluginId: string }) {
  const redirectUri = window.location.origin // TODO: this will need to change probably

  return useQuery(
    Api.PluginAuth.PostPluginAuthInteraction.getPath({ pluginId }),
    async () => {
      const result = await axios.post<
        Api.PluginAuth.PostPluginAuthInteraction.Response
      >(
        getUri(Api.PluginAuth.PostPluginAuthInteraction.getPath({ pluginId })),
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
      pluginId,
      result
    }: {
      pluginId: string
      result: Record<string, string>
    }) {
      return await axios.post(
        Api.PluginAuth.PostPluginAuthInteractionResult.getPath({ pluginId }),
        result,
        {
          withCredentials: true
        }
      )
    },
    {
      onSuccess: (data, { pluginId }) => {
        client.invalidateQueries(
          Api.PluginAuth.PostPluginAuthInteraction.getPath({ pluginId })
        )
      }
    }
  )
}
