import { FC, ReactNode } from 'react'
import { Input, Typography, Form, Button, Space } from 'antd'
import _ from 'lodash'

import { Layout } from 'src/Layout'
import { FormItemProps } from 'antd/lib/form'
import { usePluginInstaller } from 'src/queries'
import { useHistory } from 'react-router-dom'

interface Values {
  id: string
  name: string
  description?: string
  location: string
}

export const InstallLocal: FC = () => {
  const installPlugin = usePluginInstaller()
  const history = useHistory()

  return (
    <Layout title="Install Local Plugin" limitWidth>
      <Form
        layout="vertical"
        onFinish={(values: Values) => {
          console.log(values)
          installPlugin.mutate(
            {
              plugin: {
                local: true,
                id: values.id,
                name: values.name,
                description: values.description,
                source: values.location
              }
            },
            {
              onSuccess: () => {
                history.push('/plugins')
              }
            }
          )
        }}
      >
        <DescribedFormItem
          name="id"
          label="Plugin ID"
          rules={[
            {
              required: true,
              pattern: /^[a-zA-Z0-9\/-]*$/,
              message: 'Must contain only the characters: a-z A-Z 0-9 / -'
            }
          ]}
          description="Unique ID for this plugin, for instance `example/my-plugin`"
        >
          <Input />
        </DescribedFormItem>

        <DescribedFormItem
          name="name"
          label="Plugin Name"
          rules={[{ required: true }]}
          description="Human friendly name for this plugin"
        >
          <Input />
        </DescribedFormItem>

        <DescribedFormItem
          name="description"
          label="Description"
          rules={[{ required: false }]}
          description="Human friendly description for this plugin"
        >
          <Input />
        </DescribedFormItem>

        <DescribedFormItem
          name="location"
          label="Location"
          description={
            <>
              The system path to your plugin{"'"}s entry file (ie index.js). It
              will <Typography.Text strong>not</Typography.Text> be moved.
            </>
          }
          rules={[{ required: true, pattern: /.*\.js/ }]}
        >
          <Input />
        </DescribedFormItem>

        <Space>
          <Button htmlType="submit" type="primary">
            Submit
          </Button>

          {installPlugin.isError && (
            <Typography.Text type="danger">
              {String((installPlugin.error as any).response.data)}
            </Typography.Text>
          )}
        </Space>
      </Form>
    </Layout>
  )
}

const DescribedFormItem: FC<
  FormItemProps & { description: string | ReactNode }
> = ({ children, label, description, rules, ...props }) => {
  return (
    <Form.Item label={label} rules={rules}>
      <Typography.Text type="secondary">{description}</Typography.Text>

      <Form.Item {...props} rules={rules} noStyle>
        {children}
      </Form.Item>
    </Form.Item>
  )
}
