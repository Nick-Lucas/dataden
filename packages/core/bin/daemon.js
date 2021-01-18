'use strict'

const path = require('path')
const net = require('net')
const http = require('http')
const child_process = require('child_process')

const nodeStatic = require('node-static')
const httpProxy = require('http-proxy')

// Ensure relative paths start from this file's direction
process.chdir(__dirname)

// TODO: ensure letsencrypt certificate is set up

async function findFreePort({ min = 8000, max = 9000 } = {}) {
  for (let port = min; port <= max; port++) {
    const isFree = await new Promise((resolve) => {
      var server = net.createServer()

      server.once('error', function (err) {
        if (err.code === 'EADDRINUSE') {
          server.close()
          resolve(false)
        }
      })

      server.once('listening', function () {
        // close the server if listening doesn't fail
        server.close()
        resolve(true)
      })

      server.listen(port)
    })

    if (isFree) {
      return port
    }
  }

  throw `Could not find free port between ${min} and ${max}`
}

async function start() {
  const apiTest = /^\/v\d+\.\d+\//
  const corePort = await findFreePort({ min: 8700, max: 8799 })
  const coreUri = `http://localhost:${corePort}`
  const coreUriWs = `ws://localhost:${corePort}`
  const proxyPort = await findFreePort({ min: 8800, max: 8899 })

  // Fork a process for the API
  const core = child_process.fork('../dist/index.cjs.js', {
    env: {
      ...process.env,
      LOG_LEVEL: 'info',
      PORT: corePort
    },
    stdio: 'inherit'
  })

  // Set up a file host for the UI
  const uiPath = path.join(__dirname, '../dist/ui')
  const uiFiles = new nodeStatic.Server(uiPath, { indexFile: 'index.html' })

  // Create a proxy to route requests to the API
  const proxy = httpProxy.createServer({ ws: true })
  proxy.on('error', (err) => {
    console.error('[PROXY]', err)
  })

  // Create a server to recieve all requests
  const server = http
    .createServer((req, res) => {
      if (apiTest.test(req.url)) {
        console.log('Proxying API request at', req.url)
        proxy.web(req, res, { target: coreUri, ws: true })
      } else {
        console.log('Proxying UI request at', req.url)

        uiFiles.serve(req, res, (e) => {
          if (!e) return

          if (e.status === 404) {
            console.log('Rewriting to index.html', req.url)
            uiFiles.serveFile('index.html', 200, {}, req, res)
            return
          }

          console.error('Error serving ' + req.url, e)
        })
      }
    })
    .listen(proxyPort)
  server.on('error', (err) => {
    console.error('[SERVER]', err)
  })

  // Ensure websockets connections are routed to the proxy
  server.on('upgrade', function (req, socket, head) {
    console.info('UPGRADING', req.url)
    proxy.ws(req, socket, head, {
      target: coreUriWs,
      ws: true
    })
  })

  // Ensure we always clean up forked processes
  server.on('close', () => {
    console.log('server closed')
    process.exit()
  })
  core.on('exit', () => {
    console.log('core exited')
    process.exit()
  })
  process.on('unhandledRejection', (err) => {
    console.error(err)
    process.exit()
  })
  process.on('exit', () => {
    console.log('process is exiting')
    server.close()
    core.kill()
    proxy.close()
  })

  console.log(`Proxy running on port ${proxyPort}`)
}

start()
