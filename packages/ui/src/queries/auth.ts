import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as Api from '@dataden/core/dist/api-types'

import { getUri } from './common'

export function useProfile() {
  return useQuery(
    Api.Auth.GetProfile.path,
    async () => {
      const result = await axios.get<Api.Auth.GetProfile.Response>(
        getUri(Api.Auth.GetProfile.path),
        {
          withCredentials: true
        }
      )

      return result.data
    },
    {
      retry: (count, error: any) => {
        return ![401, 403].includes(error?.response?.status)
      }
    }
  )
}

type IsAuthenticated = boolean | 'reset-password'
export function useIsAuthenticated(): [
  loading: boolean,
  isAuthenticated: IsAuthenticated
] {
  const auth = useProfile()

  let isAuthenticated: IsAuthenticated = null
  if (auth.isError) {
    const status = (auth.error as any).response.status
    if (status === 403) {
      isAuthenticated = 'reset-password'
    } else {
      isAuthenticated = false
    }
  } else if (auth.isFetched) {
    isAuthenticated = true
  }

  return [auth.isFetched || auth.isError, isAuthenticated]
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

export function useProfileUpdate() {
  const client = useQueryClient()

  return useMutation(
    async function ({ profile }: { profile: Api.Auth.PostProfile.Body }) {
      return await axios.post(Api.Auth.PostProfile.path, profile)
    },
    {
      onSuccess: () => {
        client.invalidateQueries(Api.Auth.GetProfile.path)
      }
    }
  )
}
