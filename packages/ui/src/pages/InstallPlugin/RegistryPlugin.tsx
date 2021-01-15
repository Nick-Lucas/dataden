import { FC, useCallback } from 'react'
import { Button, Col, Row, Space, Tag, Tooltip, Typography } from 'antd'
import * as icons from '@ant-design/icons'

import { ContentCard } from 'src/Layout'

import { usePluginInstaller } from 'src/queries'
import * as Api from '@dataden/core/dist/api-types.esm'
import { PluginLocalityIcon } from 'src/components/PluginLocalityIcon'

export const RegistryPlugin: FC<{
  plugin: Api.Registry.RegistryPlugin
  isInstalled: boolean
}> = ({ plugin, isInstalled }) => {
  const pluginInstaller = usePluginInstaller()

  const handleInstallPlugin = useCallback(() => {
    pluginInstaller.mutate({
      plugin: plugin
    })
  }, [plugin, pluginInstaller])

  return (
    <ContentCard key={plugin.id}>
      <Row>
        <Col flex={1}>
          <Typography.Title level={4}>
            <Space>
              {/* TODO: support custon icon display from plugin registry */}
              <PluginLocalityIcon local={plugin.local} />

              {plugin.name}
            </Space>
          </Typography.Title>

          <Typography.Paragraph>{plugin.description}</Typography.Paragraph>
        </Col>

        <Col>
          {plugin.verified && (
            <Tooltip title="This means that the plugin is either 1st party or from a trusted source, and therefore believed to be safe and not abuse access to your data">
              <Tag icon={<icons.CheckSquareFilled />} color="success">
                Verified
              </Tag>
            </Tooltip>
          )}
        </Col>
      </Row>

      {/* TODO: support version management, updating and changelog viewing */}

      <Row>
        <Space size="small">
          {isInstalled ? (
            // TODO: add uninstall functionality
            <Button type="primary" danger disabled>
              Uninstall
            </Button>
          ) : (
            <Button
              icon={
                pluginInstaller.isLoading ? (
                  <icons.LoadingOutlined />
                ) : (
                  <icons.DownloadOutlined />
                )
              }
              type="primary"
              onClick={handleInstallPlugin}
              disabled={pluginInstaller.isLoading}
            >
              Install
            </Button>
          )}

          {/* TODO: support project site link */}
          <Button icon={<icons.LinkOutlined />} type="dashed" disabled>
            Project Link
          </Button>
        </Space>
      </Row>

      {pluginInstaller.isError && (
        <Typography.Text type="danger">
          {(pluginInstaller.error as any).response.data}
        </Typography.Text>
      )}
    </ContentCard>
  )
}
