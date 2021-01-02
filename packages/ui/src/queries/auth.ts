import axios from 'axios'
import { useQuery } from 'react-query'
import * as Api from '@dataden/core/dist/api-types'

import { getUri } from './common'

export function useAuth() {
  return useQuery(
    Api.Auth.GetProfile.path,
    async () => {
      const result = await axios.get<Api.Auth.GetProfile.Response>(
        getUri(Api.Auth.GetProfile.path),
        { validateStatus: (status) => [200, 401].includes(status) }
      )

      if (result.status === 200) {
        return result.data
      } else {
        return null
      }
    },
    {}
  )
}
