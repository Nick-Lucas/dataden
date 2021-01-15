import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import * as Api from '@dataden/core/dist/api-types.esm'

import { getUri } from './common'

export function useInstalledPluginsList() {
  return useQuery(Api.Plugins.GetPlugins.path, async () => {
    return (
      await axios.get<Api.Plugins.GetPlugins.Response>(
        getUri(Api.Plugins.GetPlugins.path),
        {
          withCredentials: true
        }
      )
    ).data
  })
}

export function useInstalledPlugin(params: Api.Plugins.GetPlugin.RouteParams) {
  return useQuery(Api.Plugins.GetPlugin.getPath(params), async () => {
    return (
      await axios.get<Api.Plugins.GetPlugin.Response>(
        getUri(Api.Plugins.GetPlugin.getPath(params)),
        {
          withCredentials: true
        }
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
          getUri(
            Api.Plugins.PutPlugin.getPath({
              pluginId: data.id
            })
          ),
          data,
          {
            withCredentials: true
          }
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
          getUri(Api.Plugins.GetPluginInstanceSettings.getPath(params)),
          {
            withCredentials: true
          }
        )
      ).data
    }
  )
}

export function usePluginInstaller() {
  const client = useQueryClient()

  return useMutation(
    async function ({
      plugin
    }: {
      plugin: Api.Plugins.PostInstallPlugin.Body
    }) {
      return await axios.post<Api.Plugins.PostInstallPlugin.Response>(
        getUri(Api.Plugins.PostInstallPlugin.path),
        plugin,
        {
          withCredentials: true
        }
      )
    },
    {
      onSuccess: (response, { plugin }) => {
        client.invalidateQueries(Api.Plugins.GetPlugins.path)
      }
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
          getUri(Api.Plugins.PutPluginInstanceSettings.getPath(params)),
          settings,
          {
            withCredentials: true
          }
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
