import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import * as Api from '@mydata/core/dist/api-types'

export const Queries = {
  Plugins: {
    InstalledList: 'plugins/installed',
    Installed: (id) => 'plugins/' + id,
    Settings: (pluginId, instanceName) =>
      `plugins/${pluginId}/${instanceName}/settings`
  }
}

export function useInstalledPluginsList() {
  return useQuery(Queries.Plugins.InstalledList, () => {
    return axios.get<Api.Plugins.GetPluginsResponse>('/v1.0/plugins')
  })
}

export function useInstalledPlugin(pluginId: string) {
  return useQuery(Queries.Plugins.Installed(pluginId), async () => {
    const result = await axios.get<Api.Plugins.GetPluginResponse>(
      '/v1.0/plugins/' + encodeURIComponent(pluginId)
    )

    return result.data.plugin
  })
}

export function useInstalledPluginUpdate() {
  const client = useQueryClient()

  return useMutation(
    async function ({ data }: { data: Api.Plugins.PutPluginData }) {
      return await axios.put<Api.Plugins.PutPluginResponse>(
        '/v1.0/plugins/' + encodeURIComponent(data.id),
        data
      )
    },
    {
      onSuccess: (response, { data }) => {
        client.invalidateQueries(Queries.Plugins.InstalledList)
        client.invalidateQueries(Queries.Plugins.Installed(data.id))
      }
    }
  )
}

export function usePluginInstanceSettings(
  pluginId: string,
  instanceName: string
) {
  return useQuery(
    [Queries.Plugins.Settings(pluginId, instanceName)],
    async function () {
      const result = await axios.get<Api.Plugins.GetSettingsResponse>(
        '/v1.0/plugins/' +
          encodeURIComponent(pluginId) +
          '/' +
          encodeURIComponent(instanceName) +
          '/settings'
      )

      if (typeof result.data === 'string') {
        throw result.data
      }

      return result.data
    }
  )
}

export function usePluginInstanceSettingsUpdate() {
  const client = useQueryClient()

  return useMutation(
    async function ({
      pluginId,
      instanceName,
      settings
    }: {
      pluginId: string
      instanceName: string
      settings: Api.Plugins.SetSettingsRequest
    }) {
      return await axios.post(
        '/v1.0/plugins/' +
          encodeURIComponent(pluginId) +
          '/' +
          encodeURIComponent(instanceName) +
          '/settings',
        settings
      )
    },
    {
      onSuccess: (response, { pluginId, instanceName }) => {
        client.invalidateQueries(
          Queries.Plugins.Settings(pluginId, instanceName)
        )
      }
    }
  )
}
