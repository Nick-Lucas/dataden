import { Typography } from 'antd'
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom'

import { ContentCard, Layout } from './Layout'

import { Dashboard } from './pages/Dashboard'
import { Plugins } from './pages/Plugins'
import { InstallPlugin, InstallLocal } from './pages/InstallPlugin'
import { AuthWrapper } from './pages/Login'
import { OAuth2 } from './pages/OAuth2'
import { TransformsList } from './pages/Transform'

export function App() {
  return (
    <AuthWrapper>
      <BrowserRouter>
        <Switch>
          <Route exact path="/dashboard" component={Dashboard} />
          <Redirect exact from="/" to="/dashboard" />

          <Route exact path="/plugins" component={Plugins} />
          <Route exact path="/transforms" component={TransformsList} />

          <Route
            exact
            path="/install-plugin/registry"
            component={InstallPlugin}
          />

          <Route exact path="/install-plugin/local" component={InstallLocal} />

          <Route exact path="/oauth2" component={OAuth2} />

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
    </AuthWrapper>
  )
}
