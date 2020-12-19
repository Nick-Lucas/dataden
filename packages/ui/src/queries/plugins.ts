import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as Api from '@mydata/core/dist/api-types'

export function useInstalledPluginsList() {
  return useQuery(Api.Plugins.GetPlugins.path, async () => {
    return (
      await axios.get<Api.Plugins.GetPlugins.Response>(
        Api.Plugins.GetPlugins.path
      )
    ).data
  })
}

export function useInstalledPlugin(params: Api.Plugins.GetPlugin.RouteParams) {
  return useQuery(Api.Plugins.GetPlugin.getPath(params), async () => {
    return (
      await axios.get<Api.Plugins.GetPlugin.Response>(
        Api.Plugins.GetPlugin.getPath(params)
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
        client.invalidateQueries(Api.Plugins.GetPlugins.path)
        client.invalidateQueries(
          Api.Plugins.GetPlugin.getPath({
            pluginId: data.id
          })
        )
      }
    }
  )
}

export function usePluginInstanceSettings(
  params: Api.Plugins.GetPluginInstanceSettings.RouteParams
) {
  return useQuery(
    Api.Plugins.GetPluginInstanceSettings.getPath(params),
    async function () {
      return (
        await axios.get<Api.Plugins.GetPluginInstanceSettings.Response>(
          Api.Plugins.GetPluginInstanceSettings.getPath(params)
        )
      ).data
    }
  )
}

export function usePluginInstanceSettingsUpdate() {
  const client = useQueryClient()

  return useMutation(
    async function ({
      params,
      settings
    }: {
      params: Api.Plugins.PutPluginInstanceSettings.RouteParams
      settings: Api.Plugins.PutPluginInstanceSettings.Body
    }) {
      return (
        await axios.post<Api.Plugins.PutPluginInstanceSettings.Response>(
          Api.Plugins.PutPluginInstanceSettings.getPath(params),
          settings
        )
      ).data
    },
    {
      onSuccess: (response, { params }) => {
        client.invalidateQueries(
          Api.Plugins.GetPluginInstanceSettings.getPath(params)
        )
      }
    }
  )
}
