import { css } from 'styled-components/macro'

import { ContentCard, Layout } from 'src/Layout'
import { Button } from 'antd'

export function TransformEdit() {
  return (
    <Layout title="Edit Transform" limitWidth>
      <ContentCard
        css={css`
          margin-top: 1rem;
        `}
      >
        Edit
      </ContentCard>
    </Layout>
  )
}
