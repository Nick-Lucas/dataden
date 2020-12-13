import { Typography, List, Button, Row, Space } from 'antd'
import { css } from 'styled-components/macro'

import { ContentCard } from 'src/Layout'
import { PluginInstance } from './PluginInstance'

export function Plugin({ plugin }) {
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
          <Button type="primary">Add Instance</Button>

          <Button danger>Uninstall</Button>
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
    </ContentCard>
  )
}
