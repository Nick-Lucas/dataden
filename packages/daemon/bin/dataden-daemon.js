#!/usr/bin/env node

'use strict'

process.on('unhandledRejection', (err) => {
  throw err
})

const yargs = require('yargs')
const path = require('path')
const child_process = require('child_process')

const pm2Path = path.join(__dirname, '../node_modules', '.bin/pm2')
const backendPath = path.join(__dirname, '../dist/core/index.js')
const frontendPath = path.join(__dirname, '../dist/ui')

// TODO: ensure letsencrypt certificate is set up

yargs
  .command(
    'start',
    'Start the dataden service',
    (yargs) => {
      //
    },
    (args) => {
      console.log('Starting service')

      child_process.spawnSync('node', [pm2Path, 'start', backendPath])
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

      child_process.spawnSync('node', [pm2Path, 'stop', backendPath])
    }
  )
  .demandCommand().argv
