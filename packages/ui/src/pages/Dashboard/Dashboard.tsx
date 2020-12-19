import { FC, useMemo } from 'react'
import { Typography, List, Table } from 'antd'
import * as Icons from '@ant-design/icons'
import { ColumnsType } from 'antd/lib/table'
import { Layout, ContentCard } from 'src/Layout'
import _ from 'lodash'
import { DateTime } from 'luxon'

import { useSyncsSummary } from 'src/queries'
import { Data } from '@mydata/core/dist/api-types'
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon'

export const Dashboard: FC = () => {
  const syncsSummary = useSyncsSummary()

  const pluginSyncs = useMemo(() => {
    if (!syncsSummary.data) {
      return {}
    }

    return _.groupBy(syncsSummary.data, (sync) => sync.plugin.id)
  }, [syncsSummary.data])

  return (
    <Layout title="Dashboard" limitWidth>
      <ContentCard>
        <Typography.Title level={4}>Sync Attempts</Typography.Title>
        <List
          itemLayout="vertical"
          loading={syncsSummary.isFetching && !syncsSummary.isFetched}
        >
          {Object.values(pluginSyncs).map((syncs) => (
            <List.Item key={syncs[0].plugin.id}>
              <Typography.Title level={5}>
                {syncs[0].plugin.id}
              </Typography.Title>

              <Table
                columns={columns}
                dataSource={syncs as Data.GetSyncs.ResponseItem[]}
                size="small"
                pagination={false}
                showHeader={false}
                rowKey={(item) => item.pluginInstance.name}
              />
            </List.Item>
          ))}
        </List>
      </ContentCard>
    </Layout>
  )
}

const iconProps: AntdIconProps = {
  style: {
    fontSize: '16px'
  }
}

const iconPropsAny = iconProps as any

const columns: ColumnsType<Data.GetSyncs.ResponseItem> = [
  {
    key: 'name',
    width: '100%',
    render: (value, item) => item.pluginInstance.name
  },
  {
    key: 'timeago',
    render: (value, item) => (
      <Typography.Text style={{ whiteSpace: 'nowrap' }}>
        {DateTime.fromISO(item.lastSync.date).toFormat('d LLL y, HH:mm')}
      </Typography.Text>
    )
  },
  {
    key: 'success',
    render: (value, item) =>
      item.lastSync.success ? (
        <Icons.CheckSquareTwoTone {...iconPropsAny} />
      ) : (
        <Icons.WarningTwoTone {...iconPropsAny} />
      )
  }
]
