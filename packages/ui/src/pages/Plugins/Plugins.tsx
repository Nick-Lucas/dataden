import { FC, useState } from 'react'
import { Input, Button, Row, Space } from 'antd'

import { css } from 'styled-components/macro'

import { Layout } from 'src/Layout'
import { useInstalledPluginsList } from 'src/queries'

import { Plugin } from './Plugin'

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
            <Button type="primary" size="large" disabled>
              Add New Plugin
            </Button>
          </Space>
        </Row>

        {installedPluginsQuery.isFetched &&
          installedPluginsQuery.data.data.plugins
            .filter((plugin) =>
              search && search.length > 0
                ? plugin.id.indexOf(search) >= 0
                : true
            )
            .map((plugin) => <Plugin key={plugin.id} plugin={plugin} />)}
      </Layout>
    </>
  )
}
