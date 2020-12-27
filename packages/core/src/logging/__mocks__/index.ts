import * as winston from 'winston'

export const listen = jest.fn()

export const getScoped = (): Partial<winston.Logger> => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
})

export const getPluginLogger = getScoped
