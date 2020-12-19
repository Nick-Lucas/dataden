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
  const [
    settingsMutation,
    settingsMutationResult
  ] = usePluginInstanceSettingsUpdate()

  const loaded = settingsQuery.isSuccess

  const onSubmit = useCallback(
    (values) => {
      const { settings } = values

      settingsMutation({
        pluginId: plugin.id,
        instanceName: instance.name,
        settings: JSON.parse(settings)
      })
    },
    [instance.name, plugin.id, settingsMutation]
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

  useEffect(() => {
    if (settingsMutationResult.isSuccess) {
      onSubmitted?.()
      message.success('Settings: Saved')
    }
  }, [onSubmitted, settingsMutationResult.isSuccess])

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

      {settingsMutationResult.isError && (
        <Typography.Text type="danger">
          {settingsMutationResult.status}: {settingsMutationResult.error}
        </Typography.Text>
      )}
    </Form>
  )
}
