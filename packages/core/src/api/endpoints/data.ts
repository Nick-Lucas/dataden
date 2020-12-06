import { Express } from 'express'
import { DataRow } from '@mydata/sdk'
import * as Db from 'src/db'

interface PluginParams {
  pluginId: string
  dataSetName: string
}

type GetDataResponse = Db.PagingResult<DataRow>

export function listen(app: Express) {
  // app.post<PluginParams, any, PostDataRequest, any>(
  //   '/v1.0/data/:pluginId',
  //   (request, response) => {
  //     const { pluginId: pluginId } = request.params
  //     const body = request.body

  //     datas.push(...body.data)

  //     response.status(200)
  //   }
  // )

  app.get<PluginParams, GetDataResponse, any, any>(
    '/v1.0/data/:pluginId',
    async (request, response, next) => {
      try {
        const { pluginId, dataSetName } = request.params

        const client = await Db.getClient()

        // TODO: implement paging properly
        const data = await Db.Plugins.Data.fetch(
          client,
          pluginId,
          dataSetName,
          { page: 0 },
          1000
        )

        response.send(data)
      } catch (e) {
        next(e)
      }
    }
  )
}
