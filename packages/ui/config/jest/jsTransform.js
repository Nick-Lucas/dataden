module.exports = require('babel-jest').createTransformer({
  rootMode: 'upward',
  presets: [
    [
      require.resolve('babel-preset-react-app'),
      {
        runtime: 'automatic'
      }
    ]
  ]
})
