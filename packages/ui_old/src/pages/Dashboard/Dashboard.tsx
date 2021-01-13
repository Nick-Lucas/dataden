import { FC } from 'react'

import { Layout, ContentCard } from 'src/Layout'
import { LogOutput } from './LogOutput'
import { PluginsSummary } from './PluginsSummary'

export const Dashboard: FC = () => {
  return (
    <Layout title="Dashboard">
      <ContentCard>
        <PluginsSummary />
      </ContentCard>

      <br />

      <ContentCard>
        <LogOutput />
      </ContentCard>
    </Layout>
  )
}
