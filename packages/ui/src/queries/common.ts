import { API_URI } from 'src/config'

export function getUri(path = ''): string {
  return API_URI + (path.startsWith('/') ? '' : '/') + path
}
