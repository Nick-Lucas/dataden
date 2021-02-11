import { css } from 'styled-components/macro'

import { ContentCard, Layout } from 'src/Layout'
import { Button, Form, Input, Select, Typography } from 'antd'

export function TransformEdit() {
  return (
    <Layout
      title="Edit Transform"
      limitWidth
      css={css`
        & .ant-form-item {
          margin-bottom: 10px;
        }
      `}
    >
      <Form layout="vertical">
        <Form.Item
          name="name"
          label="Name"
          rules={[{ required: true, pattern: /^[a-zA-Z0-9_]+$/ }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="sources"
          label="Sources"
          rules={[{ required: true, len: 1 }]}
        >
          <Select mode="multiple">
            <Select.Option value="a">Data A</Select.Option>
            <Select.Option value="b">Data B</Select.Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit">
          Save
        </Button>

        {/* TODO: use <Form.List /> here */}
        {/* <Form.Item>
          <Typography.Title level={5}>Step 1</Typography.Title>
          <ContentCard
            css={css`
              width: 100%;
            `}
          >
            <Form.Item>
              <Select value="combine">
                <Select.Option value="filter">Filter</Select.Option>
              </Select>
            </Form.Item>
          </ContentCard>
        </Form.Item> */}
      </Form>
    </Layout>
  )
}
