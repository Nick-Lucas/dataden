#!/usr/bin/env node

'use strict'

process.on('unhandledRejection', (err) => {
  throw err
})

require('../dist/scripts')
