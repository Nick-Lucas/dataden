import axios from 'axios'
import { useQuery } from 'react-query'
import * as Api from '@dataden/core/dist/api-types'

import { getUri } from './common'

export function useRegistry() {
  return useQuery(
    Api.Registry.GetRegistry.path,
    async () => {
      return (
        await axios.get<Api.Registry.GetRegistry.Response>(
          getUri(Api.Registry.GetRegistry.path)
        )
      ).data
    },
    {}
  )
}
