import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'

import { API_PORT } from 'src/config'

import * as endpoints from './endpoints'

import { getScoped } from 'src/logging'

export function start() {
  const app = express()
  const log = getScoped('API')

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
    log.debug('BODY', req.body)
    next()
  })

  // Listen
  endpoints.listen(app, log)
  app.listen(API_PORT)
  log.info('[API] Listening on port', API_PORT)
}
