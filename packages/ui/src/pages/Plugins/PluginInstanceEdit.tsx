import { FC, useCallback, useEffect, useState } from 'react'
import { Button, Form, Input, Row, Typography, message } from 'antd'
import { useQuery, useMutation } from 'react-query'
import axios from 'axios'
import Editor from '@monaco-editor/react'
import { editor } from 'monaco-editor'

interface PluginInstanceEditProps {
  plugin: any
  instance: any
  isNew: boolean
  onSubmitted?: () => void
}

interface EditorMountResult {
  getEditorValue: () => string
  editorElement: editor.IStandaloneCodeEditor
}

export const PluginInstanceEdit: FC<PluginInstanceEditProps> = ({
  plugin,
  instance,
  isNew = false,
  onSubmitted
}) => {
  const [mount, setMount] = useState<EditorMountResult | null>(null)

  const settingsQuery = useQuery(
    ['plugin/settings', plugin.id, instance.name],
    getPluginSettings
  )
  const [settingsMutation, settingsMutationResult] = useMutation(
    postPluginSettings
  )

  const onSubmit = useCallback(() => {
    if (!mount) {
      return
    }

    const settings = mount.getEditorValue()

    settingsMutation({
      pluginId: plugin.id,
      instanceName: instance.name,
      settings: JSON.parse(settings)
    })
  }, [instance.name, mount, plugin.id, settingsMutation])

  useEffect(() => {
    if (settingsMutationResult.isSuccess) {
      onSubmitted?.()
      message.success('Settings: Saved')
    }
  }, [onSubmitted, settingsMutationResult.isSuccess])

  return (
    <Form layout="vertical" onFinish={onSubmit}>
      <Typography.Title level={4}>
        {isNew ? `Add Instance to ${plugin.name}` : `Edit ${instance.name}`}
      </Typography.Title>

      <Form.Item label="Name">
        <Input name="name" disabled={!isNew} />
      </Form.Item>

      <Form.Item label="Settings">
        {!settingsQuery.isLoading && settingsQuery.isSuccess && (
          <Editor
            height="20rem"
            language="json"
            value={settingsQuery.data}
            width="100%"
            options={{
              lineNumbers: 'off'
            }}
            editorDidMount={(getEditorValue, editorElement) =>
              setMount({ getEditorValue, editorElement })
            }
          />
        )}
      </Form.Item>

      <Row justify="center">
        <Button
          htmlType="submit"
          type="primary"
          style={{ width: '10rem' }}
          disabled={!mount}
        >
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

async function getPluginSettings(key, pluginId, instanceName) {
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

async function postPluginSettings({ pluginId, instanceName, settings }) {
  console.log('POST', pluginId, instanceName, settings)

  return await axios.post(
    '/v1.0/plugins/' +
      encodeURIComponent(pluginId) +
      '/' +
      encodeURIComponent(instanceName) +
      '/settings',
    settings
  )
}
