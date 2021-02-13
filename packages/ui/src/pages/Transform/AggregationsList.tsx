import { FC, useState } from 'react'
import { Input, Button, Row, Space, Popover, Col } from 'antd'
import * as icons from '@ant-design/icons'

import { css } from 'styled-components/macro'

import { Layout } from 'src/Layout'
import { AggregationCard } from './AggregationCard'
import { useAggregations } from 'src/queries'
import { generatePath, Link } from 'react-router-dom'

export function AggregationsList() {
  const [search, setSearch] = useState('')
  const aggregations = useAggregations()

  return (
    <Layout title="Aggregations" limitWidth>
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
          <Link
            to={generatePath('/aggregations/:aggregationId', {
              aggregationId: 'new'
            })}
          >
            <Button type="primary" size="large">
              Create New
            </Button>
          </Link>
        </Space>
      </Row>

      {aggregations.isFetched &&
        aggregations.data
          ?.filter((aggr) =>
            search && search.length > 0 ? aggr.name.indexOf(search) >= 0 : true
          )
          .map((aggr) => (
            <AggregationCard key={aggr.name} aggregation={aggr} />
          ))}
    </Layout>
  )
}
