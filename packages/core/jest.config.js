const base = require('../../jest.config.base')

module.exports = {
  ...base,
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1'
  }
}
