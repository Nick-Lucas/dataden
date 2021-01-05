import { Express } from 'express'
import { Logger } from 'src/logging'

import * as data from './dashboard'
import * as plugins from './plugins'
import * as registry from './registry'
import * as auth from './auth'
import * as pluginsAuth from './plugins-auth'

export function listen(app: Express, log: Logger) {
  auth.listen(app, log)
  data.listen(app, log)
  plugins.listen(app, log)
  registry.listen(app, log)
  pluginsAuth.listen(app, log)
}
