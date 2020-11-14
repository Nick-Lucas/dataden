import { Express } from 'express'

import * as data from './data'
import * as plugins from './plugins'
import * as registry from './registry'

export function listen(app: Express) {
  data.listen(app)
  plugins.listen(app)
  registry.listen(app)
}
