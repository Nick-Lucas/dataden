import { Express } from 'express'

import * as data from './data'

export function add(app: Express) {
  data.add(app)
}
