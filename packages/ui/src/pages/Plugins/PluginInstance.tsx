import { FC, useCallback, useState } from 'react'
import {
  Row,
  Typography,
  Space,
  List,
  Button,
  Modal,
  message,
  Popconfirm,
  Popover
} from 'antd'
import * as icons from '@ant-design/icons'
import produce from 'immer'
import { css } from 'styled-components/macro'

import { PluginInstanceEdit } from './PluginInstanceEdit'
import {
  useInstalledPluginUpdate,
  usePluginAuthInteraction,
  usePluginForceSync
} from 'src/queries'
import * as Api from '@dataden/core/dist/api-types.esm'

interface PluginInstanceProps {
  plugin: Api.Plugins.Plugin
  instance: Api.Plugins.PluginInstance
}

export const PluginInstance: FC<PluginInstanceProps> = ({
  plugin,
  instance
}) => {
  const [editing, setEditing] = useState(false)
  const pluginUpdate = useInstalledPluginUpdate()
  const pluginAuthInteraction = usePluginAuthInteraction({
    pluginId: plugin.id,
    instanceId: instance.name
  })

  const handleRemove = useCallback(async () => {
    const update = produce(plugin, (draft) => {
      const index = draft.instances.findIndex(
        (other) => other.name === instance.name
      )
      draft.instances.splice(index, 1)
    })

    try {
      await pluginUpdate.mutateAsync({ data: update })
      message.success(`Plugin instance ${instance.name} removed`)
    } catch (err) {
      message.error('Problem removing plugin instance: ' + instance.name)
    }
  }, [instance.name, plugin, pluginUpdate])

  return (
    <List.Item>
      <Row
        css={css`
          width: 100%;
        `}
        justify="space-between"
        align="middle"
      >
        <Typography.Text>{instance.name}</Typography.Text>

        <Space>
          {pluginAuthInteraction.isFetched && pluginAuthInteraction.data?.uri && (
            <Button
              icon={<icons.WarningFilled />}
              type="primary"
              danger
              href={pluginAuthInteraction.data?.uri}
              target="_blank"
              rel="noreferrer"
            >
              Click to Connect
            </Button>
          )}

          <Button type="text" onClick={() => setEditing(true)}>
            Edit
          </Button>

          <Popconfirm
            title={`This will remove "${instance.name}" which may result in loss of data. Continue?`}
            okType="danger"
            okText="Remove"
            onConfirm={handleRemove}
          >
            <Button type="link" danger>
              Remove
            </Button>
          </Popconfirm>

          <ExtraOptions plugin={plugin} instance={instance} />
        </Space>
      </Row>

      <Modal
        visible={editing}
        onCancel={() => setEditing(false)}
        afterClose={() => setEditing(false)}
        footer={null}
        destroyOnClose
      >
        <PluginInstanceEdit
          plugin={plugin}
          instance={instance}
          onSubmitted={() => setEditing(false)}
        />
      </Modal>
    </List.Item>
  )
}

const ExtraOptions = ({ plugin, instance }: PluginInstanceProps) => {
  const forceSync = usePluginForceSync()

  return (
    <Popover
      trigger="click"
      content={
        <Space direction="vertical">
          <Row>
            <Button
              style={{ flex: '1 1 auto' }}
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
