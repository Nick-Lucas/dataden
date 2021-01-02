import { FC } from 'react'
import { Button, Form, Input, Space, Typography } from 'antd'
import { ContentCard, Layout } from 'src/Layout'
import { useLogin } from 'src/queries/auth'

export const Login: FC = () => {
  const login = useLogin()

  return (
    <Layout limitWidth title="Sign In">
      <ContentCard pad>
        <Form
          layout="vertical"
          onFinish={({ username, password }) => {
            login.mutate({
              credentials: {
                username,
                password
              }
            })
          }}
        >
          <Form.Item name="username" label="Username" required>
            <Input placeholder="Enter username" autoFocus />
          </Form.Item>

          <Form.Item name="password" label="Password" required>
            <Input type="password" placeholder="Enter password" />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit">
              Sign In
            </Button>

            {login.isError && (
              <Typography.Text type="danger">
                {String((login.error as any)?.response?.data)}{' '}
              </Typography.Text>
            )}
          </Space>
        </Form>
      </ContentCard>
    </Layout>
  )
}
