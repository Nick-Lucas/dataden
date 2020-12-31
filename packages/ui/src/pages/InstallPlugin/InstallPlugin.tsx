import { FC, useMemo } from 'react'
import { Button, Col, Row, Space, Spin, Tag, Tooltip, Typography } from 'antd'
import * as icons from '@ant-design/icons'
import _ from 'lodash'

import { Layout, ContentCard } from 'src/Layout'

import { useRegistry, useInstalledPluginsList } from 'src/queries'

export const InstallPlugin: FC = () => {
  const registry = useRegistry()
  const installed = useInstalledPluginsList()
  const installedById = useMemo(() => {
    if (!installed.data) {
      return {}
    }

    return _.keyBy(installed.data, (plugin) => plugin.id)
  }, [installed.data])

  const loaded = registry.isFetched && installed.isFetched
  const error = registry.error || installed.error

  return (
    <Layout limitWidth>
      {registry.isFetching && <Spin />}

      {error && <Typography.Text type="danger">{error}</Typography.Text>}

      {loaded &&
        registry.data.list.map((plugin) => {
          const isInstalled = !!installedById[plugin.id]

          return (
            <ContentCard key={plugin.id}>
              <Row>
                <Col flex={1}>
                  <Typography.Title level={4}>
                    <Space>
                      {/* TODO: support custon icon display from plugin registry */}
                      <icons.ApiOutlined />

                      {plugin.name}
                    </Space>
                  </Typography.Title>

                  <Typography.Paragraph>
                    {plugin.description}
                  </Typography.Paragraph>
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
                    <Button type="primary" danger>
                      Uninstall
                    </Button>
                  ) : (
                    <Button icon={<icons.DownloadOutlined />} type="primary">
                      Install
                    </Button>
                  )}

                  {/* TODO: support project site link */}
                  <Button icon={<icons.LinkOutlined />} type="dashed" disabled>
                    Project Link
                  </Button>
                </Space>
              </Row>
            </ContentCard>
          )
        })}
    </Layout>
  )
}
