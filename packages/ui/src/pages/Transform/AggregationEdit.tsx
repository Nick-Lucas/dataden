import { css } from 'styled-components/macro'

import { Layout } from 'src/Layout'
import { Button, Form, Input, Select, Typography, Divider } from 'antd'

export function AggregationEdit() {
  return (
    <Layout
      title="Edit Aggregation"
      limitWidth
      css={css`
        & .ant-form-item {
          margin-bottom: 10px;
        }
      `}
    >
      <Form layout="vertical">
        <Typography.Text type="secondary">
          Create a calculated collection based on data collected by plugins
        </Typography.Text>

        <Divider />

        <Form.Item
          name="name"
          label="Collection Name"
          rules={[{ required: true, pattern: /^[a-zA-Z0-9_]+$/ }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="sources"
          label="Source Collections"
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
