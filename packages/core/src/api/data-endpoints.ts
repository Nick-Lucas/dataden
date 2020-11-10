import { Express } from 'express'
import { DataPayload, DataRow } from '@mydata/sdk'

// TEST STORE
const datas = [] as Record<string, unknown>[]

interface PluginParams {
  pluginName: string
}

type PostDataRequest = DataPayload

interface GetDataResponse {
  data: DataRow[]
}

function add(app: Express) {
  app.post<PluginParams, any, PostDataRequest, any>(
    '/v1.0/data/:pluginName',
    (request, response) => {
      const { pluginName } = request.params
      const body = request.body

      datas.push(...body.data)

      response.sendStatus(200)
    }
  )

  app.get<any, GetDataResponse, any, any>(
    '/v1.0/data/:pluginName',
    (request, response) => {
      const { pluginName } = request.params
      const data = request.body

      response.send({
        data: datas
      })
    }
  )
}
