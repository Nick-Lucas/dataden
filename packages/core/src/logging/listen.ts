import * as winston from 'winston'
import { MESSAGE } from 'triple-beam'
import _ from 'lodash'

import { transportConsole } from './transports'

export type LogInfo = winston.Logform.TransformableInfo & {
  formattedMessage: string
}
export type ListenCallback = (infos: LogInfo[]) => void

export function listen(callback: ListenCallback): () => void {
  const buffer: { infos: LogInfo[] } = { infos: [] }
  const maybeFlushBuffer = _.throttle(
    () => {
      if (buffer.infos.length === 0) {
        return
      }

      const infos = buffer.infos
      buffer.infos = []
      callback(infos)
    },
    300,
    { leading: false, trailing: true }
  )

  const listener = (info: winston.Logform.TransformableInfo) => {
    buffer.infos.push({
      ...info,
      formattedMessage: info[(MESSAGE as unknown) as string]
    })

    maybeFlushBuffer()
  }

  transportConsole.addListener('logged', listener)

  return () => {
    transportConsole.removeListener('logged', listener)
  }
}
