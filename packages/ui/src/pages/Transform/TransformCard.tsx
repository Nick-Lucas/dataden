import { css } from 'styled-components/macro'
import { Link } from 'react-router-dom'

import { ContentCard } from 'src/Layout'
import { Button } from 'antd'

export function TransformCard() {
  return (
    <ContentCard
      css={css`
        margin-top: 1rem;
      `}
    >
      Transform{'  '}
      <Link to="/transforms/mytransformid">
        <Button type="primary">Edit</Button>
      </Link>
    </ContentCard>
  )
}
