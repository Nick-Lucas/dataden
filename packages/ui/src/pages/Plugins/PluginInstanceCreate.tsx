import { FC, useCallback, useEffect, useMemo } from 'react'
import { Button, Form, Input, Row, Typography } from 'antd'
import produce from 'immer'
import { Rule } from 'antd/lib/form'
import { useInstalledPlugin, useInstalledPluginUpdate } from 'src/queries'

interface PluginInstanceCreateProps {
  plugin: any
  onSubmitted?: () => void
}

export const PluginInstanceCreate: FC<PluginInstanceCreateProps> = ({
  plugin,
  onSubmitted
}) => {
  const pluginQuery = useInstalledPlugin(plugin.id)
  const [pluginMutation, pluginMutationResult] = useInstalledPluginUpdate()

  const onSubmit = useCallback(
    ({ name }) => {
      const pluginInstallation = produce(pluginQuery.data, (draft) => {
        draft.instances.push({ name })
      }) as any

      pluginMutation({
        data: pluginInstallation
      })
    },
    [pluginMutation, pluginQuery.data]
  )

  useEffect(() => {
    if (pluginMutationResult.isSuccess) {
      onSubmitted?.()
    }
  }, [onSubmitted, pluginMutationResult.isSuccess])

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
      <Typography.Title level={4}>
        Add Instance to {plugin.name}
      </Typography.Title>

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

      {pluginMutationResult.isError && (
        <Typography.Text type="danger">
          {pluginMutationResult.status}:{' '}
          {JSON.stringify(pluginMutationResult.error)}
        </Typography.Text>
      )}
    </Form>
  )
}
