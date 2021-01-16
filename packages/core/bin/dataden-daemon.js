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

const daemonName = 'dataden-daemon'
const daemonPath = path.normalize(path.join(__dirname, './reverse-proxy.js'))

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

      spawnPm2('start', daemonPath, '--name', daemonName)
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

      spawnPm2('stop', daemonName)
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
      spawnPm2('logs', [daemonName])
    }
  )
  .command(
    'logs',
    'See process logs',
    (yargs) => {
      //
    },
    () => {
      spawnPm2('logs', [daemonName])
    }
  )
  .demandCommand().argv
