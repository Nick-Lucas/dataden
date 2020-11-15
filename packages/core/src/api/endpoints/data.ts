import { Express } from 'express'
import { DataRow } from '@mydata/sdk'
import { getClient, PagingResult, Plugins } from 'src/db'

interface PluginParams {
  pluginId: string
}

type GetDataResponse = PagingResult<DataRow>

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
        const { pluginId } = request.params

        const client = await getClient()

        // TODO: implement paging properly
        const data = await Plugins.Data.fetch(
          client,
          pluginId,
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
