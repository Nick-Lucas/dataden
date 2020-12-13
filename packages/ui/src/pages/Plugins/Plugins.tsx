import { FC, useState } from 'react'
import { Input, Button, Row, Space } from 'antd'
import { useQuery } from 'react-query'
import axios from 'axios'
import { css } from 'styled-components/macro'

import { Layout } from 'src/Layout'

import { Plugin } from './Plugin'

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
            .map((plugin) => <Plugin key={plugin.id} plugin={plugin} />)}
      </Layout>
    </>
  )
}
