import { Express } from 'express'
import { Logger } from 'src/logging'

import * as data from './dashboard'
import * as plugins from './plugins'
import * as registry from './registry'

export function listen(app: Express, log: Logger) {
  data.listen(app, log)
  plugins.listen(app, log)
  registry.listen(app, log)
}
