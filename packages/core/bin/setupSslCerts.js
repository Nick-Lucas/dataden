'use strict'

const packageJson = require('../package.json')
const greenlock = require('greenlock')
const path = require('path')
const os = require('os')

function getIPAddresses() {
  const networkInterfaces = os.networkInterfaces()

  const results = []
  for (const interfaceKey of Object.keys(networkInterfaces)) {
    for (const interfaceItem of networkInterfaces[interfaceKey]) {
      if (interfaceItem.family === 'IPv4') {
        if (!results.includes(interfaceItem.address)) {
          results.push(interfaceItem.address)
        }
      }
    }
  }

  return results
}

async function setup() {
  console.log('[SSL Setup] Starting')
  const instance = greenlock.create({
    packageRoot: path.join(__dirname, '..'),
    configDir: path.join(__dirname, '..', '.ssl/'),
    packageAgent: 'dataden/' + packageJson.version,
    maintainerEmail: 'ssl@mydataden.com',
    staging: true,
    notify: function (event, details) {
      if ('error' === event) {
        console.error(
          "[SSL Setup] Could not initialise Let's Encrypt instance",
          details
        )
      }
    }
  })

  //
  // Configure manager

  console.log('[SSL Setup] Setting configuration')
  await instance.manager
    .defaults({
      agreeToTerms: true,
      subscriberEmail: 'ssl@mydataden.com'
    })
    .then(function (fullConfig) {
      // ...
    })

  //
  // Configure host names

  const ipAddresses = getIPAddresses()
  console.log('[SSL Setup] Determined IP addresses to configure:', ipAddresses)
  const subject = ipAddresses[0]

  await instance
    .add({
      subject: ipAddresses[0],
      altnames: ipAddresses
    })
    .then(function () {
      // saved config to db (or file system)
    })

  //
  // Fetch config
  console.log('[SSL Setup] Loading final certs')
  try {
    await instance.get({ servername: subject }).then(function (pems) {
      if (pems && pems.privkey && pems.cert && pems.chain) {
        console.info(
          "Successfully generated an SSL certificate via Let's Encrypt"
        )
      }
    })

    return true
  } catch (e) {
    console.error(
      "Failed to generate an SSL certificate via Let's Encrypt:",
      e.code
    )
    console.error(e)

    return false
  }
}

module.exports = {
  setup
}
