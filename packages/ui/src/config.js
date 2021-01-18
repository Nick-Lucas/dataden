const isHTTPS = window.location.protocol.toLocaleLowerCase().includes('https')
const hostAndPort = window.location.host

export const API_URI = (isHTTPS ? 'https://' : 'http://') + hostAndPort

export const WS_URI = (isHTTPS ? 'wss://' : 'ws://') + hostAndPort
