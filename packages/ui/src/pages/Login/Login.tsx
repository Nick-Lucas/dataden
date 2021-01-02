import { FC } from 'react'
import { Button, Form, Input } from 'antd'
import { ContentCard, Layout } from 'src/Layout'

export const Login: FC = () => {
  return (
    <Layout limitWidth title="Sign In">
      <ContentCard pad>
        <Form layout="vertical">
          <Form.Item name="username" label="Username" required>
            <Input placeholder="Enter username" autoFocus />
          </Form.Item>

          <Form.Item name="password" label="Password" required>
            <Input type="password" placeholder="Enter password" />
          </Form.Item>

          <Button type="primary">Sign In</Button>
        </Form>
      </ContentCard>
    </Layout>
  )
}
