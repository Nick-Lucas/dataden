import { css } from 'styled-components/macro'
import { Link } from 'react-router-dom'

import { ContentCard } from 'src/Layout'
import {
  Button,
  Divider,
  notification,
  Popconfirm,
  Row,
  Space,
  Tag,
  Typography
} from 'antd'
import { Aggregations } from '@dataden/core/dist/api-types.esm'
import { useAggregationRemoval } from 'src/queries'
import { useCallback } from 'react'

export function AggregationCard({
  aggregation
}: {
  aggregation: Aggregations.Aggregation
}) {
  const remove = useAggregationRemoval()

  const onRemove = useCallback(async () => {
    await remove.mutateAsync({ params: { name: aggregation.name } })
    notification.success({ message: `Removed aggregation ${aggregation.name}` })
  }, [aggregation.name, remove])

  return (
    <ContentCard
      css={css`
        margin-top: 1rem;
      `}
    >
      <Row justify="space-between">
        <Typography.Title style={{ margin: 0 }} level={4}>
          {aggregation.name}
        </Typography.Title>

        <Space>
          <Link to={'/aggregations/' + aggregation.name}>
            <Button type="default">Edit</Button>
          </Link>

          <Popconfirm
            title="Are you sure you want to delete this aggregation?"
            okText="Delete"
            okType="danger"
            onConfirm={onRemove}
          >
            <Button type="default" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      </Row>

      <Divider style={{ margin: '4px 0' }} />

      <Row>
        <Space wrap>
          <Typography.Text>Sources:</Typography.Text>

          {aggregation.sources.map((source) => (
            <Tag key={source}>{source}</Tag>
          ))}
        </Space>
      </Row>
    </ContentCard>
  )
}
