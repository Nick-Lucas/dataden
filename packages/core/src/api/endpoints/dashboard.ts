import { Express } from 'express'
// import { DataRow } from '@mydata/sdk'
import * as Db from 'src/db'
import { Scheduler } from 'src/lib/Scheduler'

import { MaybeError } from './common.types'
import { GetStatus } from './dashboard.types'

// type GetDataResponse = Db.PagingResult<DataRow>

export function listen(app: Express) {
  app.get<void, MaybeError<GetStatus.Response>, void, void>(
    GetStatus.path,
    async (request, response) => {
      try {
        const client = await Db.getClient()

        const result: GetStatus.Response = []
        const plugins = await Db.Plugins.Installed.list(client)
        for (const plugin of plugins) {
          const definition = await Scheduler.getPluginDefinition(plugin.id)

          for (const instance of plugin.instances) {
            const lastSync = await Db.Plugins.Syncs.last(
              client,
              {
                pluginServiceName: definition.service.name,
                instanceName: instance.name
              },
              {}
            )

            const status = Scheduler.getStatus(plugin.id, instance.name)

            result.push({
              plugin,
              pluginInstance: instance,
              lastSync,
              status
            })
          }
        }
        // console.log(result)
        response.send(result)
      } catch (error) {
        response.sendStatus(500)
        response.send(String(error))
      }
    }
  )

  // TODO: bring this back
  // app.post<PluginParams, any, PostDataRequest, any>(
  //   '/v1.0/data/:pluginId',
  //   (request, response) => {
  //     const { pluginId: pluginId } = request.params
  //     const body = request.body
  //     datas.push(...body.data)
  //     response.status(200)
  //   }
  // )
  // app.get<PluginParams, GetDataResponse, any, any>(
  //   '/v1.0/data/:pluginId',
  //   async (request, response, next) => {
  //     try {
  //       const { pluginId, dataSetName } = request.params
  //       const client = await Db.getClient()
  //       // TODO: implement paging properly
  //       const data = await Db.Plugins.Data.fetch(
  //         client,
  //         pluginId,
  //         dataSetName,
  //         { page: 0 },
  //         1000
  //       )
  //       response.send(data)
  //     } catch (e) {
  //       next(e)
  //     }
  //   }
  // )
}
