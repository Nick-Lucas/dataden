import { Row, Space, Button, Popover, Popconfirm } from 'antd'
import * as icons from '@ant-design/icons'

import {
  usePluginForceSync,
  usePluginAuthReset,
  usePluginAuthState
} from 'src/queries'
import * as Api from '@dataden/core/dist/api-types.esm'

interface PluginInstanceProps {
  plugin: Api.Plugins.Plugin
  instance: Api.Plugins.PluginInstance
}

export const PluginInstanceMenu = ({
  plugin,
  instance
}: PluginInstanceProps) => {
  const forceSync = usePluginForceSync()
  const authState = usePluginAuthState({
    pluginId: plugin.id,
    instanceId: instance.name
  })
  const authReset = usePluginAuthReset()

  const cannotReset =
    authState.isLoading || authReset.isLoading || !authState.data?.resettable

  return (
    <Popover
      trigger="click"
      content={
        <Space direction="vertical">
          <Row>
            <Button
              style={{ flex: '1 1 auto', alignItems: 'flex-start' }}
              onClick={() =>
                forceSync.mutate({
                  pluginId: plugin.id,
                  instanceId: instance.name
                })
              }
              disabled={forceSync.isLoading}
            >
              <Space>
                <icons.SyncOutlined />
                Sync Now
              </Space>
            </Button>
          </Row>

          <Row>
            <Popconfirm
              title="Are you sure? You will have to authorize this instance again."
              onConfirm={() =>
                authReset.mutate({
                  pluginId: plugin.id,
                  instanceId: instance.name
                })
              }
              okText="Reset"
              okType="danger"
              disabled={cannotReset}
            >
              <Button
                style={{ flex: '1 1 auto', alignItems: 'flex-start' }}
                danger
                disabled={cannotReset}
              >
                <Space>
                  <icons.LogoutOutlined />
                  Reset Auth
                </Space>
              </Button>
            </Popconfirm>
          </Row>
        </Space>
      }
    >
      <Button
        type="ghost"
        size="large"
        icon={<icons.EllipsisOutlined />}
      ></Button>
    </Popover>
  )
}
