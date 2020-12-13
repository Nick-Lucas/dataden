import { FC, useState } from 'react'
import { Row, Typography, Space, List, Button, Modal } from 'antd'
import { css } from 'styled-components/macro'
import { PluginInstanceEdit } from './PluginInstanceEdit'

interface PluginInstanceProps {
  plugin: any
  instance: any
}

export const PluginInstance: FC<PluginInstanceProps> = ({
  plugin,
  instance
}) => {
  const [editing, setEditing] = useState(false)

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

          <Button type="dashed" danger disabled>
            Remove
          </Button>
        </Space>
      </Row>

      <Modal
        visible={editing}
        onCancel={() => setEditing(false)}
        afterClose={() => setEditing(false)}
        footer={null}
      >
        <PluginInstanceEdit
          plugin={plugin}
          instance={instance}
          isNew={false}
          onSubmitted={() => setEditing(false)}
        />
      </Modal>
    </List.Item>
  )
}
