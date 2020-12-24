import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Terminal, ITheme } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import 'xterm/css/xterm.css'

import * as colors from '@ant-design/colors'

import * as Api from '@mydata/core/dist/api-types'

import { WS_URI } from 'src/config'

const theme: ITheme = {
  background: 'transparent',
  selection: colors.blue.primary,
  white: 'black',
  foreground: colors.grey[7]
}

export function LogOutput() {
  const termRef = useRef()
  const { term, fitAddon } = useMemo(() => {
    const term = new Terminal({
      theme,
      allowTransparency: true
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)

    return { term, fitAddon }
  }, [])

  useLayoutEffect(() => {
    term.open(termRef.current)
    fitAddon.fit()

    return () => {
      term.dispose()
      fitAddon.dispose()
    }
  }, [fitAddon, term])

  useEffect(() => {
    const ws = new WebSocket(WS_URI + '/v1.0/console')

    ws.onerror = (ev) => {
      console.error('Console Connection Error', ev)
    }

    ws.onmessage = (ev) => {
      const infos: Api.Console.ConsoleSocket.Response = JSON.parse(ev.data)
      for (const info of infos) {
        for (const line of info.formattedMessage.split('\n')) {
          term.writeln(line)
        }
      }
    }

    return () => {
      ws.close()
    }
  }, [term])

  return <div style={{ height: '30rem' }} ref={termRef} />
}
