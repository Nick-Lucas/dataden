import { Typography, Col, Row } from 'antd'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'
import styled from 'styled-components/macro'

import { Layout } from './Layout'

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
                  <ContentCardCSS>
                    <Typography.Paragraph>Content</Typography.Paragraph>
                  </ContentCardCSS>
                </Col>
              </Row>
            </Layout>
          )}
        />
        <Redirect exact from="/" to="/dashboard" />

        <Route
          exact
          path="/plugins"
          component={() => (
            <Layout title="Plugins">
              <ContentCardCSS>
                <Typography.Paragraph>Content</Typography.Paragraph>
              </ContentCardCSS>
            </Layout>
          )}
        />

        <Route
          path="*"
          component={() => {
            return (
              <Layout title="404">
                <ContentCardCSS>
                  <Typography.Paragraph>Unknown Page</Typography.Paragraph>
                </ContentCardCSS>
              </Layout>
            )
          }}
        />
      </Switch>
    </BrowserRouter>
  )
}

const ContentCardCSS = styled.div`
  padding: 0 1rem;
  background-color: white;

  box-shadow: 0px 2px 3px 0px gray;
`
