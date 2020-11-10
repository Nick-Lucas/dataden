import { Express } from 'express'

import * as data from './data'
import * as plugins from './plugins'

export function add(app: Express) {
  data.add(app)
  plugins.add(app)
}
