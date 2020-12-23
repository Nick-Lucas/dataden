import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'
import Websockets from 'ws'

import { API_PORT } from 'src/config'

import * as endpoints from './endpoints'

import { getScoped } from 'src/logging'

export function start() {
  const app = express()
  const log = getScoped('API')

  // cors
  app.use(cors())

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())

  // Tie in logging
  app.use(
    morgan('dev', {
      stream: {
        write: function (message) {
          log.info(message)
        }
      }
    })
  )

  // Log request bodies
  app.use((req, res, next) => {
    log.debug('BODY: \n' + JSON.stringify(req.body, null, 2))
    next()
  })

  // Listen
  endpoints.listen(app, log)
  const server = app.listen(API_PORT)
  log.info('[API] Listening on port ' + API_PORT)

  // Set up websockets connection

  const wss = new Websockets.Server({ clientTracking: false, noServer: true })

  server.on('upgrade', function (request, socket, head) {
    log.info('Parsing session from request...', request, socket, head)

    // TODO: check session as in: https://github.com/websockets/ws/blob/master/examples/express-session-parse/index.js
    wss.handleUpgrade(request, socket, head, function (ws) {
      wss.emit('connection', ws, request)
    })
  })

  wss.on('connection', function (ws, request) {
    ws.send('HELLO!')
    log.info('WS Connected ' + JSON.stringify(request))

    ws.on('message', function (message) {
      //
      // Here we can now use session parameters.
      //
      console.log(`Received message: ${message}`)
    })

    ws.on('close', function () {
      //
    })
  })
}
