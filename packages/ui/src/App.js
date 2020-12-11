import { Typography, Col, Row } from 'antd'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'

import { ContentCard, Layout } from './Layout'

import { Plugins } from './pages/Plugins'

export function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          exact
          path="/dashboard"
          component={() => (
            <Layout title="Dashboard">
              <Row gutter={[16, 16]}>
                <Col span="24">
                  <ContentCard>
                    <Typography.Paragraph>Content</Typography.Paragraph>
                  </ContentCard>
                </Col>
              </Row>
            </Layout>
          )}
        />
        <Redirect exact from="/" to="/dashboard" />

        <Route exact path="/plugins" component={Plugins} />

        <Route
          path="*"
          component={() => {
            return (
              <Layout title="404">
                <ContentCard>
                  <Typography.Paragraph>Unknown Page</Typography.Paragraph>
                </ContentCard>
              </Layout>
            )
          }}
        />
      </Switch>
    </BrowserRouter>
  )
}
