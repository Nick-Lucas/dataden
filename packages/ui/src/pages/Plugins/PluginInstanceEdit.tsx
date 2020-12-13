import { FC } from 'react'
import { Form, Input, Typography } from 'antd'
import { useQuery } from 'react-query'
import axios from 'axios'

interface PluginInstanceEditProps {
  plugin: any
  instance: any
  isNew: boolean
}

export const PluginInstanceEdit: FC<PluginInstanceEditProps> = ({
  plugin,
  instance,
  isNew = false
}) => {
  const settingsQuery = useQuery(
    ['plugin/settings', plugin.id, instance.name],
    getPluginSettings
  )

  return (
    <>
      <Typography.Title level={4}>
        {isNew ? `Add Instance to ${plugin.name}` : `Edit ${instance.name}`}
      </Typography.Title>

      <Form layout="vertical">
        <Form.Item label="Name">
          <Input name="name" disabled={!isNew} />
        </Form.Item>

        <Form.Item label="Schedule">
          <Input.TextArea
            name="schedule"
            value={JSON.stringify(settingsQuery.data?.data.schedule)}
            disabled={settingsQuery.isLoading && !settingsQuery.isSuccess}
          />
        </Form.Item>

        <Form.Item label="Plugin Settings">
          <Input.TextArea
            name="plugin"
            value={JSON.stringify(settingsQuery.data?.data.plugin)}
            disabled={settingsQuery.isLoading && !settingsQuery.isSuccess}
          />
        </Form.Item>
      </Form>
    </>
  )
}

function getPluginSettings(key, pluginId, instanceName) {
  return axios.get(
    '/v1.0/plugins/' +
      encodeURIComponent(pluginId) +
      '/' +
      encodeURIComponent(instanceName) +
      '/settings'
  )
}
