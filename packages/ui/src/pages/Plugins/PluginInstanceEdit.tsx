import { FC, useCallback, useEffect } from 'react'
import { Button, Form, Row, Typography, message } from 'antd'
import { JSONEditor } from './JSONEditor'
import {
  usePluginInstanceSettings,
  usePluginInstanceSettingsUpdate
} from 'src/queries'

interface PluginInstanceEditProps {
  plugin: any
  instance: any
  onSubmitted?: () => void
}

export const PluginInstanceEdit: FC<PluginInstanceEditProps> = ({
  plugin,
  instance,
  onSubmitted
}) => {
  const settingsQuery = usePluginInstanceSettings(plugin.id, instance.name)
  const settingsUpdate = usePluginInstanceSettingsUpdate()

  const loaded = settingsQuery.isSuccess

  const onSubmit = useCallback(
    async (values) => {
      const { settings } = values

      try {
        await settingsUpdate.mutateAsync({
          pluginId: plugin.id,
          instanceName: instance.name,
          settings: JSON.parse(settings)
        })

        onSubmitted?.()
        message.success('Settings: Saved')
      } catch (err) {}
    },
    [instance.name, onSubmitted, plugin.id, settingsUpdate]
  )

  const [form] = Form.useForm()

  useEffect(() => {
    if (settingsQuery.isSuccess && settingsQuery.data) {
      form.setFieldsValue({
        name: instance?.name ?? '',
        settings: JSON.stringify(settingsQuery.data, null, 2)
      })
    }
  }, [form, instance?.name, settingsQuery.data, settingsQuery.isSuccess])

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Typography.Title level={4}>Edit {instance.name}</Typography.Title>

      <Form.Item label="Settings" name={loaded ? 'settings' : undefined}>
        {loaded && <JSONEditor />}
      </Form.Item>

      <Row justify="center">
        <Button htmlType="submit" type="primary" style={{ width: '10rem' }}>
          Submit
        </Button>
      </Row>

      {settingsUpdate.isError && (
        <Typography.Text type="danger">
          {settingsUpdate.status}: {settingsUpdate.error}
        </Typography.Text>
      )}
    </Form>
  )
}
