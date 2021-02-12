import { css } from 'styled-components/macro'
import { Link } from 'react-router-dom'

import { ContentCard } from 'src/Layout'
import { Button } from 'antd'

export function AggregationCard() {
  return (
    <ContentCard
      css={css`
        margin-top: 1rem;
      `}
    >
      Transform{'  '}
      <Link to="/aggregations/myaggregationid">
        <Button type="primary">Edit</Button>
      </Link>
    </ContentCard>
  )
}
