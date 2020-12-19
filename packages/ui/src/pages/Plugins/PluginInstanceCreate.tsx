import { FC, useCallback, useMemo } from 'react'
import { Button, Form, Input, Row, Typography } from 'antd'
import produce from 'immer'
import { Rule } from 'antd/lib/form'
import { useInstalledPlugin, useInstalledPluginUpdate } from 'src/queries'

import * as Api from '@mydata/core/dist/api-types'

interface PluginInstanceCreateProps {
  plugin: Api.Plugins.Plugin
  onSubmitted?: () => void
}

export const PluginInstanceCreate: FC<PluginInstanceCreateProps> = ({
  plugin,
  onSubmitted
}) => {
  const pluginQuery = useInstalledPlugin({ pluginId: plugin.id })
  const pluginUpdate = useInstalledPluginUpdate()

  const onSubmit = useCallback(
    async ({ name }) => {
      const pluginInstallation = produce(pluginQuery.data, (draft) => {
        draft.instances.push({ name })
      }) as any

      try {
        await pluginUpdate.mutateAsync({
          data: pluginInstallation
        })
        onSubmitted?.()
      } catch (err) {}
    },
    [onSubmitted, pluginQuery.data, pluginUpdate]
  )
  const validators = useMemo<Rule[]>(() => {
    return [
      {
        validator: async (obj, value) => {
          if (
            pluginQuery.data?.instances.some(
              (instance) =>
                instance.name?.toLowerCase() === value?.toLowerCase()
            )
          ) {
            throw new Error('Plugin instance already exists')
          }
        }
      }
    ]
  }, [pluginQuery.data])

  return (
    <Form layout="vertical" onFinish={onSubmit}>
      <Typography.Title level={4}>Add Instance to {plugin.id}</Typography.Title>

      <Form.Item label="Name" name="name" rules={validators}>
        <Input autoFocus />
      </Form.Item>

      <Row justify="center">
        <Button
          htmlType="submit"
          type="primary"
          style={{ width: '10rem' }}
          disabled={!pluginQuery.isSuccess}
        >
          Submit
        </Button>
      </Row>

      {pluginUpdate.isError && (
        <Typography.Text type="danger">
          {pluginUpdate.status}: {String(pluginUpdate.error)}
        </Typography.Text>
      )}
    </Form>
  )
}
