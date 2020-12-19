import { useState } from 'react'
import { Typography, List, Button, Row, Space, Modal } from 'antd'
import { css } from 'styled-components/macro'

import { ContentCard } from 'src/Layout'
import { PluginInstance } from './PluginInstance'
import { PluginInstanceCreate } from './PluginInstanceCreate'

export function Plugin({ plugin }) {
  const [addingInstance, setAddingInstance] = useState(false)

  return (
    <ContentCard
      key={plugin.id}
      css={css`
        margin-top: 1rem;
        padding: 0.5rem 1rem;
      `}
    >
      <Row justify="space-between">
        <Typography.Title
          level={4}
          style={{
            marginBottom: 0
          }}
        >
          {plugin.name} {plugin.version >= 0 && `(version: {plugin.version})`}
        </Typography.Title>

        <Space>
          <Button type="primary" onClick={() => setAddingInstance(true)}>
            Add Instance
          </Button>

          <Button danger disabled>
            Uninstall
          </Button>
        </Space>
      </Row>
      <Row>
        <Typography.Text type="secondary">{plugin.location}</Typography.Text>
      </Row>

      <List>
        {plugin.instances.map((instance) => (
          <PluginInstance
            key={instance.name}
            plugin={plugin}
            instance={instance}
          />
        ))}
      </List>

      <Modal
        visible={addingInstance}
        onCancel={() => setAddingInstance(false)}
        afterClose={() => setAddingInstance(false)}
        footer={null}
        destroyOnClose
      >
        <PluginInstanceCreate
          plugin={plugin}
          onSubmitted={() => setAddingInstance(false)}
        />
      </Modal>
    </ContentCard>
  )
}