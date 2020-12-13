import axios from 'axios'
import { useMutation, useQuery, useQueryCache } from 'react-query'

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
    return axios.get('/v1.0/plugins')
  })
}

export function useInstalledPlugin(pluginId: string) {
  return useQuery(Queries.Plugins.Installed(pluginId), async () => {
    const result = await axios.get(
      '/v1.0/plugins/' + encodeURIComponent(pluginId)
    )

    return result.data.plugin
  })
}

export function useInstalledPluginUpdate() {
  const cache = useQueryCache()

  return useMutation(
    async function ({ data }: { data: any }) {
      return await axios.put(
        '/v1.0/plugins/' + encodeURIComponent(data.id),
        data
      )
    },
    {
      onSuccess: (response, { data }) => {
        cache.invalidateQueries(Queries.Plugins.InstalledList)
        cache.invalidateQueries(Queries.Plugins.Installed(data.id))
      }
    }
  )
}

export function usePluginInstanceSettings(
  pluginId: string,
  instanceName: string
) {
  return useQuery(
    [Queries.Plugins.Settings(pluginId, instanceName), pluginId, instanceName],
    async function (key, pluginId: string, instanceName: string) {
      const result = await axios.get(
        '/v1.0/plugins/' +
          encodeURIComponent(pluginId) +
          '/' +
          encodeURIComponent(instanceName) +
          '/settings'
      )

      const { plugin, schedule } = result.data

      return JSON.stringify(
        {
          plugin,
          schedule
        },
        null,
        2
      )
    }
  )
}

export function usePluginInstanceSettingsUpdate() {
  const cache = useQueryCache()

  return useMutation(
    async function ({
      pluginId,
      instanceName,
      settings
    }: {
      pluginId: string
      instanceName: string
      settings: unknown
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
        cache.invalidateQueries(
          Queries.Plugins.Settings(pluginId, instanceName)
        )
      }
    }
  )
}
