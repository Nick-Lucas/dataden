import { useMemo } from 'react'
import { Button, notification, Space, Typography } from 'antd'

import { usePluginAuthInteractionResult } from 'src/queries'
import { useQueryParams, StringParam } from 'use-query-params'

import * as Api from '@dataden/core/dist/api-types'
import { ContentCard, Layout } from 'src/Layout'
import { useHistory } from 'react-router-dom'

export function OAuth2() {
  const history = useHistory()
  const update = usePluginAuthInteractionResult()

  const params = useQueryParams({
    code: StringParam,
    scope: StringParam,
    state: StringParam
  })[0]

  const result = useMemo(
    () =>
      ({
        ...params,
        state: JSON.parse(String(params.state))
      } as Api.PluginAuth.PostPluginAuthInteractionResult.OAuthResult),
    [params]
  )

  const isValid = useMemo(() => {
    return !!(
      result.code &&
      result.scope &&
      result.state?.pluginId &&
      result.state?.instanceName
    )
  }, [
    result.code,
    result.scope,
    result.state?.instanceName,
    result.state?.pluginId
  ])

  return (
    <Layout title="Plugin Connection" limitWidth>
      <ContentCard pad>
        {isValid ? (
          <Space direction="vertical">
            {update.isError ? (
              <Typography.Text>{String(update.error)}</Typography.Text>
            ) : (
              <Typography.Text>
                <strong>Success!</strong> You can now complete the connection
              </Typography.Text>
            )}

            <Button
              disabled={update.isError || update.isLoading}
              onClick={() => {
                update
                  .mutateAsync({
                    params: {
                      pluginId: result.state.pluginId,
                      instanceId: result.state.instanceName
                    },
                    result: result
                  })
                  .then(() => {
                    notification.success({
                      message: `Successfully connected plugin ${result.state.pluginId} (${result.state.instanceName}) to 3rd party!`
                    })
                    history.push('/')
                  })
              }}
              type="primary"
            >
              Complete Sign In
            </Button>
          </Space>
        ) : (
          <Space direction="vertical">
            <Typography.Text type="danger">
              The response from the 3rd party is missing one or more of code,
              scope, state.pluginId, state.instanceName. This may be a bug in
              the plugin, or work may needed in DataDen to support this
              provider.
            </Typography.Text>
          </Space>
        )}
      </ContentCard>
    </Layout>
  )
}
