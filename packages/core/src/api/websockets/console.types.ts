import * as Logging from 'src/logging'

export namespace ConsoleSocket {
  export const path = '/v1.0/console'

  export type ResponseItem = Logging.LogInfo
  export type Response = ResponseItem[]
}
