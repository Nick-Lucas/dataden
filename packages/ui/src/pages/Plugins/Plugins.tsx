import { FC, useState } from 'react'
import { Input, Button, Row, Space, Popover, Col } from 'antd'
import * as icons from '@ant-design/icons'

import { css } from 'styled-components/macro'

import { Layout } from 'src/Layout'
import { useInstalledPluginsList } from 'src/queries'

import { Plugin } from './Plugin'
import { Link } from 'react-router-dom'

export const Plugins: FC = () => {
  const [search, setSearch] = useState('')

  const installedPluginsQuery = useInstalledPluginsList()

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
            <Popover
              trigger="click"
              content={
                <Space direction="vertical">
                  <Row>
                    <Link
                      to="/install-plugin/registry"
                      style={{ flex: '1 1 auto' }}
                    >
                      <Space>
                        <icons.CloudFilled />
                        From Registry
                      </Space>
                    </Link>
                  </Row>

                  <Row>
                    <Link
                      to="/install-plugin/local"
                      style={{ flex: '1 1 auto' }}
                    >
                      <Space>
                        <icons.FolderFilled />
                        Local
                      </Space>
                    </Link>
                  </Row>
                </Space>
              }
            >
              <Button type="primary" size="large">
                Add New Plugin
              </Button>
            </Popover>
          </Space>
        </Row>

        {installedPluginsQuery.isFetched &&
          installedPluginsQuery.data
            ?.filter((plugin) =>
              search && search.length > 0
                ? plugin.id.indexOf(search) >= 0
                : true
            )
            .map((plugin) => <Plugin key={plugin.id} plugin={plugin} />)}
      </Layout>
    </>
  )
}
