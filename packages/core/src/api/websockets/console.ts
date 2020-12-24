import { route } from './common'
import * as http from 'http'
import * as uuid from 'uuid'

import { getScoped } from 'src/logging'

export function listen(server: http.Server) {
  route(server, '/v1.0/console', function (ws, request) {
    const connectionId = uuid.v4()
    const log = getScoped(`Websocket - ${request.url} - ${connectionId}`)
    log.info('Connected')

    // TODO: send logs since startup
    ws.send('HELLO!')

    // TODO: listen to logger and forward on messages

    ws.on('close', function () {
      log.info('Disconnected')
    })
  })
}
