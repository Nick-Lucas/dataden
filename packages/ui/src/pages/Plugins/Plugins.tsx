import { FC, useState } from 'react'
import { Typography, Input, List, Button, Row, Space } from 'antd'
import { useQuery } from 'react-query'
import axios from 'axios'
import { css } from 'styled-components/macro'

import { Layout, ContentCard } from 'src/Layout'

const getInstalledPlugins = () => {
  return axios.get('/v1.0/plugins')
}

export const Plugins: FC = () => {
  const [installed, setInstalled] = useState()
  const [search, setSearch] = useState('')

  const installedPluginsQuery = useQuery(
    'plugins/installed',
    getInstalledPlugins
  )

  return (
    <>
      <Layout title="Installed Plugins" limitWidth>
        <Row align="stretch">
          <div
            css={css`
              flex: 1 1 auto;
            `}
          >
            <Input
              autoFocus
              size="large"
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search"
              suffix={'...'}
            />
          </div>

          <Space>
            <div />
            <Button type="primary" size="large">
              Add New Plugin
            </Button>
          </Space>
        </Row>

        {installedPluginsQuery.isFetched &&
          installedPluginsQuery.data.data.plugins
            .filter((plugin) =>
              search && search.length > 0
                ? plugin.name.indexOf(search) >= 0
                : true
            )
            .map((plugin) => (
              <ContentCard
                key={plugin.id}
                css={css`
                  margin-top: 1rem;
                  padding: 0.5rem 1rem;
                `}
              >
                <Row justify="space-between">
                  <Typography.Title level={4} style={{ marginBottom: 0 }}>
                    {plugin.name}{' '}
                    {plugin.version >= 0 && `(version: {plugin.version})`}
                  </Typography.Title>

                  <Space>
                    <Button type="primary">Add Instance</Button>

                    <Button danger>Uninstall</Button>
                  </Space>
                </Row>
                <Row>
                  <Typography.Text type="secondary">
                    {plugin.location}
                  </Typography.Text>
                </Row>

                <List>
                  {plugin.instances.map((instance) => (
                    <List.Item key={instance.name}>
                      <Row
                        css={css`
                          width: 100%;
                        `}
                        justify="space-between"
                        align="middle"
                      >
                        <Typography.Text>{instance.name}</Typography.Text>

                        <Space>
                          <Button type="text">Edit</Button>
                          <Button type="dashed" danger>
                            Remove
                          </Button>
                        </Space>
                      </Row>
                    </List.Item>
                  ))}
                </List>
              </ContentCard>
            ))}
      </Layout>
    </>
  )
}
