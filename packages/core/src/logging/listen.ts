import * as winston from 'winston'
import { MESSAGE } from 'triple-beam'

import { transportConsole } from './transports'

export type ListenCallback = (info: winston.Logform.TransformableInfo) => void

export function listen(callback: ListenCallback): () => void {
  const listener: ListenCallback = (info) =>
    callback({
      ...info,
      formattedMessage: info[(MESSAGE as unknown) as string]
    })

  transportConsole.addListener('logged', listener)

  return () => {
    transportConsole.removeListener('logged', listener)
  }
}
