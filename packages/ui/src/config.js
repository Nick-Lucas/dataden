export const HTTPS = process.env.REACT_APP_HTTPS == 'true'

export const API_URI =
  (HTTPS ? 'https://' : 'http://') + process.env.REACT_APP_API_URI

export const WS_URI =
  (HTTPS ? 'wss://' : 'ws://') + process.env.REACT_APP_API_URI
