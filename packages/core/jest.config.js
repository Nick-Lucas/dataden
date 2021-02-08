const base = require('../../jest.config.base')

/** @type {import("@jest/types/build/Config").ProjectConfig} */
module.exports = {
  ...base,
  rootDir: __dirname,
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1'
  }
}
