import axios from 'axios'
import { useQuery } from 'react-query'
import * as Api from '@mydata/core/dist/api-types'

export function useSyncsSummary() {
  return useQuery(
    Api.Data.GetSyncs.path,
    async () => {
      return (
        await axios.get<Api.Data.GetSyncs.Response>(Api.Data.GetSyncs.path)
      ).data
    },
    {
      refetchInterval: 10000
    }
  )
}
