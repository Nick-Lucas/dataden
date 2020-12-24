import { route } from './common'
import * as http from 'http'
import * as uuid from 'uuid'

import * as Logging from 'src/logging'

import { ConsoleSocket } from './console.types'

export function listen(server: http.Server) {
  route(server, ConsoleSocket.path, function (ws, request) {
    const connectionId = uuid.v4()
    const log = Logging.getScoped(
      `Websocket - ${request.url} - ${connectionId}`
    )
    log.info('Connected')

    // TODO: send logs since startup
    // ws.send('HELLO!')

    const stopListening = Logging.listen((infos) => {
      ws.send(JSON.stringify(infos))
    })

    ws.on('close', function () {
      stopListening()
      log.info('Disconnected')
    })
  })
}
