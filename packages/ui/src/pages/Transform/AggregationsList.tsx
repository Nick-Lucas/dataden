import { FC, useState } from 'react'
import { Input, Button, Row, Space, Popover, Col } from 'antd'
import * as icons from '@ant-design/icons'

import { css } from 'styled-components/macro'

import { Layout } from 'src/Layout'
import { AggregationCard } from './AggregationCard'

export function AggregationsList() {
  const [search, setSearch] = useState('')

  const transforms = [{ id: '1' }]

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
      </Row>

      {transforms
        ?.filter((plugin) =>
          search && search.length > 0 ? plugin.id.indexOf(search) >= 0 : true
        )
        .map((plugin) => (
          <AggregationCard key={plugin.id} />
        ))}
    </Layout>
  )
}
