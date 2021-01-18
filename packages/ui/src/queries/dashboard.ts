import axios from 'axios'
import { useQuery } from 'react-query'
import * as Api from '@dataden/core/dist/api-types.esm'

import { getUri } from './common'

export function useSyncsSummary() {
  return useQuery(
    Api.Data.GetStatus.path,
    async () => {
      return (
        await axios.get<Api.Data.GetStatus.Response>(
          getUri(Api.Data.GetStatus.path),
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
