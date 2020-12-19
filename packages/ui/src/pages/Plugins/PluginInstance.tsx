import { FC, useCallback, useState } from 'react'
import {
  Row,
  Typography,
  Space,
  List,
  Button,
  Modal,
  message,
  Popconfirm
} from 'antd'
import produce from 'immer'
import { css } from 'styled-components/macro'

import { PluginInstanceEdit } from './PluginInstanceEdit'
import { useInstalledPluginUpdate } from 'src/queries'
import * as Api from '@mydata/core/dist/api-types'

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
          <Button type="text" onClick={() => setEditing(true)}>
            Edit
          </Button>

          <Popconfirm
            title={`This will remove "${instance.name}" which may result in loss of data. Continue?`}
            okType="danger"
            okText="Remove"
            onConfirm={handleRemove}
          >
            <Button type="dashed" danger>
              Remove
            </Button>
          </Popconfirm>
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