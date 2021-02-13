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

import {
  useAggregations,
  useAggregationUpsert,
  useCollections
} from 'src/queries'
import { useCallback, useMemo, useRef } from 'react'
import { OptionProps } from 'antd/lib/select'
import { useHistory, useParams } from 'react-router-dom'

export function AggregationEdit() {
  const history = useHistory()
  const { aggregationId } = useParams() as { aggregationId: string }
  const isNew = aggregationId.toLowerCase() === 'new'

  const collections = useCollections()
  const aggregations = useAggregations()

  const loaded = collections.isFetched && aggregations.isFetched

  const initialData = useMemo(() => {
    if (isNew) {
      return {}
    }

    if (!loaded) {
      return null
    }

    return aggregations.data?.find((a) => a.name === aggregationId) ?? {}
  }, [aggregationId, aggregations.data, isNew, loaded])

  const upsert = useAggregationUpsert()

  const existingAggregationNamesRef = useRef<string[]>([])
  const existingAggregationNames = useMemo(() => {
    return aggregations.data?.map((aggr) => aggr.name) ?? []
  }, [aggregations.data])
  existingAggregationNamesRef.current = existingAggregationNames

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

  const onSubmit = useCallback(
    async (values) => {
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

        history.push('/aggregations')
      } catch (e) {
        notification.error({
          message: `Aggregation failed to create/update: ${String(
            e.response.data
          )}`
        })
      }
    },
    [history, upsert]
  )

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
      {(!loaded || !initialData) && <div>Loading</div>}

      {loaded && initialData && (
        <Form layout="vertical" initialValues={initialData} onFinish={onSubmit}>
          <Typography.Text type="secondary">
            Create a calculated collection based on data collected by plugins
          </Typography.Text>

          <Divider />

          <Form.Item
            name="name"
            label="Collection Name"
            rules={[
              { required: true, pattern: /^[a-zA-Z0-9_]+$/ },
              {
                validator: async (rule, value: string) => {
                  if (value.toLowerCase() === 'new') {
                    throw 'Name already in use'
                  }

                  if (
                    value !== aggregationId &&
                    existingAggregationNamesRef.current.includes(value)
                  ) {
                    throw 'Name already in use'
                  }
                }
              }
            ]}
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
            {isNew ? 'Create' : 'Update'}
          </Button>
        </Form>
      )}
    </Layout>
  )
}
