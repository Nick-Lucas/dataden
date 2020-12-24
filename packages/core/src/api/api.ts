import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import morgan from 'morgan'

import { API_PORT } from 'src/config'

import * as endpoints from './endpoints'
import * as websockets from './websockets'

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
  websockets.listen(server)

  log.info('[API] Listening on port ' + API_PORT)
}
