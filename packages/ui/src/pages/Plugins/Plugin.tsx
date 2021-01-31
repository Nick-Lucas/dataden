import { FC, useState } from 'react'
import { Typography, List, Button, Row, Space, Modal } from 'antd'
import * as icons from '@ant-design/icons'
import { css } from 'styled-components/macro'

import { ContentCard } from 'src/Layout'
import { PluginInstance } from './PluginInstance'
import { PluginInstanceCreate } from './PluginInstanceCreate'

import * as Api from '@dataden/core/dist/api-types.esm'
import { PluginLocalityIcon } from 'src/components/PluginLocalityIcon'
import { useInstalledPluginUpgrade } from 'src/queries'

interface PluginProps {
  plugin: Api.Plugins.Plugin
  onSubmitted?: () => void
}

export const Plugin: FC<PluginProps> = ({ plugin }) => {
  const [addingInstance, setAddingInstance] = useState(false)

  const pluginUpgrade = useInstalledPluginUpgrade({
    pluginId: plugin.id
  })

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
                {plugin.id} ({plugin.version})
              </Typography.Title>
            </Space>
          </Typography.Title>

          <Space>
            <Button
              type="primary"
              disabled={!pluginUpgrade.data?.updatable}
              icon={<icons.ArrowUpOutlined />}
            >
              Update
            </Button>

            <Button danger disabled icon={<icons.DeleteOutlined />}>
              Uninstall
            </Button>
          </Space>
        </Row>

        <Row>
          <Typography.Text
            type="secondary"
            ellipsis
            style={{ direction: 'rtl' }}
          >
            {plugin.location}
          </Typography.Text>
        </Row>

        <List
          header={
            <Row align="middle" justify="space-between">
              <Typography.Text strong>Instances:</Typography.Text>

              <Button
                type="link"
                onClick={() => setAddingInstance(true)}
                icon={<icons.PlusOutlined />}
              >
                Add
              </Button>
            </Row>
          }
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
