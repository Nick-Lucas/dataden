import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as Api from '@dataden/core/dist/api-types'

import { getUri } from './common'

export function useAuth() {
  return useQuery(
    Api.Auth.GetProfile.path,
    async () => {
      const result = await axios.get<Api.Auth.GetProfile.Response>(
        getUri(Api.Auth.GetProfile.path),
        {
          validateStatus: (status) => [200, 401].includes(status),
          withCredentials: true
        }
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

export function useLogin() {
  const client = useQueryClient()

  return useMutation(
    async function ({ credentials }: { credentials: Api.Auth.PostLogin.Body }) {
      return await axios.post(Api.Auth.PostLogin.path, credentials)
    },
    {
      onSuccess: () => {
        client.invalidateQueries(Api.Auth.GetProfile.path)
      }
    }
  )
}
