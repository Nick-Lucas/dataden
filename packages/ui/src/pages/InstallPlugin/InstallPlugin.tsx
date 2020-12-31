import { ChangeEvent, FC, useMemo, useState } from 'react'
import { Col, Input, Row, Space, Spin, Typography } from 'antd'
import _ from 'lodash'

import { Layout } from 'src/Layout'

import { useRegistry, useInstalledPluginsList } from 'src/queries'

import { RegistryPlugin } from './RegistryPlugin'

export const InstallPlugin: FC = () => {
  const [search, setSearch] = useState('')
  const handleSearchChanged = useMemo(() => {
    return _.debounce(
      (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
      },
      300,
      { leading: false, trailing: true }
    )
  }, [])

  const registry = useRegistry()
  const installed = useInstalledPluginsList()

  const plugins = useMemo(() => {
    if (!registry.data) {
      return []
    }

    return registry.data.list.filter((plugin) =>
      (plugin.name?.toLowerCase() ?? '').includes(search.toLowerCase())
    )
  }, [registry.data, search])

  const installedById = useMemo(() => {
    if (!installed.data) {
      return {}
    }

    return _.keyBy(installed.data, (plugin) => plugin.id)
  }, [installed.data])

  const fetching = registry.isFetching && installed.isFetching
  const loaded = registry.isFetched && installed.isFetched
  const error = registry.error || installed.error

  return (
    <Layout title="Install Plugin" limitWidth>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Row align="stretch">
          <Col flex={1}>
            <Input
              autoFocus
              size="large"
              onChange={handleSearchChanged}
              placeholder="Search"
              suffix={'...'}
            />
          </Col>
        </Row>

        {fetching && !loaded && <Spin />}

        {error && <Typography.Text type="danger">{error}</Typography.Text>}

        {loaded &&
          plugins.map((plugin) => (
            <RegistryPlugin
              key={plugin.id}
              isInstalled={!!installedById[plugin.id]}
              plugin={plugin}
            />
          ))}
      </Space>
    </Layout>
  )
}
