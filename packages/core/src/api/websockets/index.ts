import * as http from 'http'
import * as console from './console'

export function listen(server: http.Server) {
  console.listen(server)
}
