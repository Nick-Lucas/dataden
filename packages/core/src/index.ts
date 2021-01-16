import 'source-map-support/register'

import './config'
import * as api from './api'
import * as Scheduler from './lib/Scheduler'

api.start()

Scheduler.start()
