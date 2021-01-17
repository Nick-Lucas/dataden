const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = (app) => {
  app.use(
    '/v*',
    createProxyMiddleware({
      target: 'http://localhost:8001',
      changeOrigin: true,
      ws: true,
      logLevel: 'debug'
    })
  )
}
