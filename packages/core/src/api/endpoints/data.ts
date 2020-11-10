import { Express } from 'express'
import { DataPayload, DataRow } from '@mydata/sdk'

// TEST STORE
const datas = [] as DataRow[]

interface PluginParams {
  pluginName: string
}

type PostDataRequest = DataPayload

interface GetDataResponse {
  data: DataRow[]
}

export function add(app: Express) {
  app.post<PluginParams, any, PostDataRequest, any>(
    '/v1.0/data/:pluginName',
    (request, response) => {
      const { pluginName } = request.params
      const body = request.body

      console.log('[Post Data]', pluginName, body)
      datas.push(...body.data)

      response.sendStatus(200)
    }
  )

  app.get<any, GetDataResponse, any, any>(
    '/v1.0/data/:pluginName',
    (request, response) => {
      const { pluginName } = request.params

      console.log('[Post Data]', pluginName, datas)
      response.send({
        data: datas
      })
    }
  )
}
