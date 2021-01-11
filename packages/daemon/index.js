const serve = require('serve-handler')
const httpProxy = require('http-proxy')
const path = require('path')
const http = require('http')

const api = 'http://localhost:8001'
const apiTest = /^\/v\d+\.\d+\//
const port = 8843

const proxy = httpProxy.createServer()
http
  .createServer((req, res) => {
    if (apiTest.test(req.url)) {
      console.log('Proxying API request', req.url)
      proxy.web(req, res, { target: api })
    } else {
      console.log('Proxying UI request', req.url)
      serve(req, res, {
        public: path.join(__dirname, './dist/ui')
        // rewrites: [{ source: '/**', destination: '/index.html' }],
      })
    }
  })
  .listen(port)

console.log(`Proxy running on port ${port}`)
