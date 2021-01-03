import { Express } from 'express'
import * as Db from 'src/db'
import { Scheduler } from 'src/lib/Scheduler'
import { Logger } from 'src/logging'

import { MaybeError, authenticatedEndpoint } from './common'
import { GetStatus } from './dashboard.types'

export function listen(app: Express, log: Logger) {
  app.get<void, MaybeError<GetStatus.Response>, void, void>(
    GetStatus.path,
    authenticatedEndpoint(),
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
                pluginId: definition.plugin.id,
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

        response.send(result)
      } catch (error) {
        response.sendStatus(500)
        response.send(String(error))
      }
    }
  )
}
