import { FC } from 'react'
import { Button, Form, Input, Space, Typography } from 'antd'
import { ContentCard, Layout } from 'src/Layout'
import { useProfileUpdate } from 'src/queries/auth'

export const ResetPassword: FC = () => {
  const update = useProfileUpdate()

  return (
    <Layout limitWidth title="Reset Password">
      <ContentCard pad>
        <Form
          layout="vertical"
          onFinish={({ password1, password2 }) => {
            update.mutate({
              profile: {
                password: password1
              }
            })
          }}
        >
          <Form.Item
            name="password1"
            label="Password"
            required
            rules={[
              {
                required: true,
                min: 6,
                message: 'Minimum of 6 characters',
                whitespace: false
              }
            ]}
          >
            <Input type="password" placeholder="Enter password" />
          </Form.Item>

          <Form.Item
            name="password2"
            label="Password (again)"
            required
            rules={[
              {
                required: true,
                min: 6,
                message: 'Minimum of 6 characters',
                whitespace: false
              },
              ({ getFieldValue }) => ({
                validator(rule, value) {
                  if (getFieldValue('password1') === value) {
                    return Promise.resolve()
                  }

                  return Promise.reject('Passwords do not match')
                }
              })
            ]}
          >
            <Input type="password" placeholder="Enter the same password" />
          </Form.Item>

          <Space>
            <Button type="primary" htmlType="submit">
              Save
            </Button>

            {update.isError && (
              <Typography.Text type="danger">
                {String((update.error as any)?.response?.data)}{' '}
              </Typography.Text>
            )}
          </Space>
        </Form>
      </ContentCard>
    </Layout>
  )
}
