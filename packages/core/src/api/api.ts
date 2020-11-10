import express from 'express'
import bodyParser from 'body-parser'
import morgan from 'morgan'

import { API_PORT, LOG } from 'src/config'

export function start() {
  const app = express()

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())

  app.use(morgan('dev'))
  if (LOG.LOG_BODY) {
    app.use((req, res, next) => {
      console.log('BODY', req.body)
      next()
    })
  }

  app.listen(API_PORT)
  console.log('[API] Listening on port', API_PORT)
}
