import { Row, Space, Button, Popover, Popconfirm } from 'antd'
import * as icons from '@ant-design/icons'

import { usePluginForceSync, usePluginAuthReset } from 'src/queries'
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
  const authReset = usePluginAuthReset()

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
            >
              <Button
                style={{ flex: '1 1 auto', alignItems: 'flex-start' }}
                danger
                disabled={authReset.isLoading}
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
