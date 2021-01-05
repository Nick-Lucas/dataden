import * as config from './config'
import * as api from './api'
import * as Scheduler from './lib/Scheduler'

config.validate()

api.start()

Scheduler.start()
