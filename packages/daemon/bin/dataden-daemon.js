#!/usr/bin/env node

'use strict'

process.on('unhandledRejection', (err) => {
  throw err
})

const yargs = require('yargs')
const path = require('path')
const child_process = require('child_process')

const pm2Path = path.normalize(
  path.join(__dirname, '../node_modules', '.bin/pm2')
)

const backendName = 'dataden-core'
const backendPath = path.normalize(
  path.join(__dirname, '../../core/dist/index.cjs.js')
)

const reverseProxyName = 'dataden-webserver'
const reverseProxyPath = path.normalize(path.join(__dirname, '../index.js'))

// TODO: ensure letsencrypt certificate is set up

function spawnPm2(cmd, ...args) {
  child_process.spawnSync('node', [pm2Path, cmd, ...args], {
    stdio: 'inherit',
    env: process.env
  })
}

yargs
  .command(
    'start',
    'Start the dataden service',
    (yargs) => {
      //
    },
    (args) => {
      console.log('Starting service')

      spawnPm2('start', backendPath, '--name', backendName)
      spawnPm2('start', reverseProxyPath, '--name', reverseProxyName)
    }
  )
  .command(
    'stop',
    'Stop the dataden service',
    (yargs) => {
      //
    },
    (args) => {
      console.log('Stopping service')

      spawnPm2('stop', backendName)
      spawnPm2('stop', reverseProxyName)
    }
  )
  .command(
    'status',
    'See process status',
    (yargs) => {
      //
    },
    () => {
      spawnPm2('list')
    }
  )
  .demandCommand().argv
