import { css } from 'styled-components/macro'

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
      <Button type="primary">Edit</Button>
    </ContentCard>
  )
}
