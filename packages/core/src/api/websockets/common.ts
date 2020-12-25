import Websockets from 'ws'
import * as http from 'http'

import { getScoped } from 'src/logging'

export function route(
  server: http.Server,
  path: string,
  onConnected: (
    this: Websockets.Server,
    socket: Websockets,
    request: http.IncomingMessage
  ) => void
) {
  const log = getScoped(`Websocket`)

  const wss = new Websockets.Server({
    clientTracking: false,
    noServer: true,
    path: path
  })

  server.on('upgrade', function (request, socket, head) {
    if (!wss.shouldHandle(request)) {
      return
    }

    log.info('Connecting...')

    // TODO: check session as in: https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js
    wss.handleUpgrade(request, socket, head, function (ws, request) {
      wss.emit('connection', ws, request)
    })
  })

  wss.on('connection', onConnected)
}
