import { Express } from 'express'
import { DataPayload, DataRow } from '@mydata/sdk'

// TEST STORE
const datas = [] as DataRow[]

interface PluginParams {
  pluginId: string
}

type PostDataRequest = DataPayload

interface GetDataResponse {
  data: DataRow[]
}

export function listen(app: Express) {
  app.post<PluginParams, any, PostDataRequest, any>(
    '/v1.0/data/:pluginId',
    (request, response) => {
      const { pluginId: pluginId } = request.params
      const body = request.body

      console.log('[Post Data]', pluginId, body)
      datas.push(...body.data)

      response.sendStatus(200)
    }
  )

  app.get<any, GetDataResponse, any, any>(
    '/v1.0/data/:pluginId',
    (request, response) => {
      const { pluginId } = request.params

      console.log('[Post Data]', pluginId, datas)
      response.send({
        data: datas
      })
    }
  )
}
