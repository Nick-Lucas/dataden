import { FC, useState } from 'react'
import { Typography, List, Button, Row, Space, Modal } from 'antd'
import { css } from 'styled-components/macro'

import { ContentCard } from 'src/Layout'
import { PluginInstance } from './PluginInstance'
import { PluginInstanceCreate } from './PluginInstanceCreate'

import * as Api from '@dataden/core/dist/api-types'
import { PluginLocalityIcon } from 'src/components/PluginLocalityIcon'

interface PluginProps {
  plugin: Api.Plugins.Plugin
  onSubmitted?: () => void
}

export const Plugin: FC<PluginProps> = ({ plugin }) => {
  const [addingInstance, setAddingInstance] = useState(false)

  return (
    <ContentCard
      key={plugin.id}
      css={css`
        margin-top: 1rem;
      `}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row justify="space-between">
          <Typography.Title
            level={4}
            style={{
              marginBottom: 0
            }}
          >
            <Space>
              <PluginLocalityIcon local={plugin.local} />

              <Typography.Title
                level={4}
                style={{
                  marginBottom: 0
                }}
              >
                {plugin.id}{' '}
                {(plugin.version ?? -1) >= 0 && `(version: ${plugin.version})`}
              </Typography.Title>
            </Space>
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

        <List
          header={<Typography.Text strong>Instances:</Typography.Text>}
          bordered
          size="small"
        >
          {plugin.instances.map((instance) => (
            <PluginInstance
              key={instance.name}
              plugin={plugin}
              instance={instance}
            />
          ))}
        </List>
      </Space>

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
