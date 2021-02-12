import { css } from 'styled-components/macro'

import { Layout } from 'src/Layout'
import {
  Button,
  Form,
  Input,
  Select,
  Typography,
  Divider,
  notification
} from 'antd'

import { useAggregationUpsert, useCollections } from 'src/queries'
import { useMemo } from 'react'
import { OptionProps } from 'antd/lib/select'

export function AggregationEdit() {
  const collections = useCollections()
  const upsert = useAggregationUpsert()

  const sources = useMemo(() => {
    if (!collections.data) {
      return []
    }

    return collections.data.map<OptionProps>((c) => {
      return {
        value: c.name,
        children: c.name
      }
    })
  }, [collections.data])

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
      <Form
        layout="vertical"
        onFinish={async (values) => {
          try {
            const collection = await upsert.mutateAsync({
              body: {
                name: values.name,
                sources: values.sources
              }
            })

            notification.success({
              message: `Aggregation ${collection.name} created/updated successfully!`
            })
            // TODO: redirect back to list
          } catch (e) {
            notification.error({
              message: `Aggregation failed to create/update: ${String(
                e.response.data
              )}`
            })
          }
        }}
      >
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
          rules={[{ required: true, min: 1, type: 'array' }]}
        >
          <Select
            mode="multiple"
            disabled={!collections.isFetched}
            options={sources}
          />
        </Form.Item>

        <Button type="primary" htmlType="submit" disabled={upsert.isLoading}>
          Save
        </Button>
      </Form>
    </Layout>
  )
}
