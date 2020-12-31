import { FC, useMemo } from 'react'
import { Button, Row, Spin, Typography } from 'antd'
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
              {/* TODO: support icon display */}
              <Typography.Title level={4}>{plugin.name}</Typography.Title>

              <Typography.Paragraph>{plugin.description}</Typography.Paragraph>

              {/* TODO: support project site link */}

              {/* TODO: support version management, updating and changelog viewing */}

              <Row>
                {isInstalled ? (
                  // TODO: add uninstall functionality
                  <Button type="primary" danger>
                    Uninstall
                  </Button>
                ) : (
                  <Button type="primary">Install</Button>
                )}
              </Row>
            </ContentCard>
          )
        })}
    </Layout>
  )
}
