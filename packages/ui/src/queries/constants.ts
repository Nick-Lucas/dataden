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
  return useQuery(Queries.Plugins.InstalledList, async () => {
    return (
      await axios.get<Api.Plugins.GetPlugins.Response>(
        Api.Plugins.GetPlugins.path
      )
    ).data
  })
}

export function useInstalledPlugin(pluginId: string) {
  return useQuery(Queries.Plugins.Installed(pluginId), async () => {
    return (
      await axios.get<Api.Plugins.GetPlugin.Response>(
        Api.Plugins.GetPlugin.getPath({
          pluginId: pluginId
        })
      )
    ).data
  })
}

export function useInstalledPluginUpdate() {
  const client = useQueryClient()

  return useMutation(
    async function ({ data }: { data: Api.Plugins.PutPlugin.Body }) {
      return (
        await axios.put<Api.Plugins.PutPlugin.Response>(
          Api.Plugins.PutPlugin.getPath({
            pluginId: data.id
          }),
          data
        )
      ).data
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
  instanceId: string
) {
  return useQuery(
    [Queries.Plugins.Settings(pluginId, instanceId)],
    async function () {
      return (
        await axios.get<Api.Plugins.GetPluginInstanceSettings.Response>(
          Api.Plugins.GetPluginInstanceSettings.getPath({
            pluginId,
            instanceId
          })
        )
      ).data
    }
  )
}

export function usePluginInstanceSettingsUpdate() {
  const client = useQueryClient()

  return useMutation(
    async function ({
      pluginId,
      instanceId,
      settings
    }: {
      pluginId: string
      instanceId: string
      settings: Api.Plugins.PutPluginInstanceSettings.Body
    }) {
      return (
        await axios.post<Api.Plugins.PutPluginInstanceSettings.Response>(
          Api.Plugins.PutPluginInstanceSettings.getPath({
            pluginId,
            instanceId
          }),
          settings
        )
      ).data
    },
    {
      onSuccess: (response, { pluginId, instanceId }) => {
        client.invalidateQueries(Queries.Plugins.Settings(pluginId, instanceId))
      }
    }
  )
}
