import fs from 'fs'

import { PluginServiceDefinition } from './types'

import * as Db from 'src/db'

import { PluginService, pluginInstanceIsValid } from '@dataden/sdk'

import { getScoped } from 'src/logging'
const log = getScoped('PluginManager')

export function uninstallPlugin() {
  throw '[uninstallPlugin] Not Implemented'
}
