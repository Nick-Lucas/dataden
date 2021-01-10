import { FC, ReactNode, useMemo } from 'react'
import _ from 'lodash'
import { DateTime } from 'luxon'

import { Typography, List, Table, Space } from 'antd'
import * as Icons from '@ant-design/icons'
import * as colors from '@ant-design/colors'
import { ColumnsType } from 'antd/lib/table'
import { BaseType } from 'antd/lib/typography/Base'
import { AntdIconProps } from '@ant-design/icons/lib/components/AntdIcon'

import { useSyncsSummary } from 'src/queries'
import { Data } from '@dataden/core/dist/api-types'
import { PluginLocalityIcon } from 'src/components/PluginLocalityIcon'
import { Link } from 'react-router-dom'

type Sentiment = 'Positive' | 'Neutral' | 'Negative'
type PluginSummary = Data.GetStatus.ResponseItem & {
  summary: string
  sentiment: Sentiment
}

function choose<T extends string | number | symbol, R>(
  value: T,
  opts: Record<T, R>
) {
  return opts[value]
}

export const PluginsSummary: FC = () => {
  const pluginsSummary = useSyncsSummary()

  const pluginSyncs = useMemo(() => {
    if (!pluginsSummary.data) {
      return []
    }

    return _(pluginsSummary.data)
      .groupBy((instance) => instance.plugin.id)
      .mapValues((instances, pluginId) =>
        _.map(
          instances,
          (instance): PluginSummary => {
            if (instance.status.running) {
              if (instance.lastSync.date) {
                return {
                  ...instance,
                  sentiment: 'Positive',
                  summary: DateTime.fromISO(instance.lastSync.date).toFormat(
                    'd LLL y, HH:mm'
                  )
                }
              } else {
                return {
                  ...instance,
                  sentiment: 'Neutral',
                  summary: 'Never Run'
                }
              }
            } else {
              return {
                ...instance,
                sentiment: 'Negative',
                summary: instance.status.status
              }
            }
          }
        )
      )
      .values()
      .value()
  }, [pluginsSummary.data])

  return (
    <>
      <Typography.Title level={4}>Summary</Typography.Title>

      <List
        itemLayout="vertical"
        loading={pluginsSummary.isFetching && !pluginsSummary.isFetched}
      >
        {pluginSyncs.length === 0 ? (
          <Typography.Text type="secondary">
            {"Nothin' to report boss... maybe "}{' '}
            <Link to="/plugins">install some plugins?</Link>
          </Typography.Text>
        ) : (
          pluginSyncs.map((syncs) => (
            <List.Item key={syncs[0].plugin.id}>
              <Typography.Title level={5}>
                <Space>
                  <PluginLocalityIcon local={syncs[0].plugin.local} />

                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {syncs[0].plugin.id}
                  </Typography.Title>
                </Space>
              </Typography.Title>

              <Table
                columns={columns}
                dataSource={syncs as Data.GetStatus.ResponseItem[]}
                size="small"
                pagination={false}
                showHeader={false}
                rowKey={(item) => item.pluginInstance.name}
              />
            </List.Item>
          ))
        )}
      </List>
    </>
  )
}

const iconProps: AntdIconProps = {
  style: {
    fontSize: '16px'
  }
}

const iconPropsAny = iconProps as any

const columns: ColumnsType<PluginSummary> = [
  {
    key: 'name',
    width: '100%',
    render: (value, item) => item.pluginInstance.name
  },
  {
    key: 'timeago',
    render: (value, item) => (
      <Typography.Text
        style={{ whiteSpace: 'nowrap' }}
        type={choose<Sentiment, BaseType>(item.sentiment, {
          Positive: 'secondary',
          Negative: 'danger',
          Neutral: 'secondary'
        })}
      >
        {item.summary}
      </Typography.Text>
    ),
    align: 'right'
  },
  {
    key: 'success',
    render: (value, item) =>
      choose<Sentiment, ReactNode>(item.sentiment, {
        Positive: (
          <Icons.CheckSquareTwoTone
            {...iconPropsAny}
            twoToneColor={colors.green[5]}
          />
        ),
        Negative: (
          <Icons.WarningTwoTone
            {...iconPropsAny}
            twoToneColor={colors.red[5]}
          />
        ),
        Neutral: (
          <Icons.ClockCircleTwoTone
            {...iconPropsAny}
            twoToneColor={colors.grey[0]}
          />
        )
      })
  }
]
