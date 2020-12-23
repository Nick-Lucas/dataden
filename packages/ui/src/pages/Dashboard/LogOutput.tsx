import { useEffect, useState } from 'react'

import { WS_URI } from 'src/config'

export function LogOutput() {
  const [state, setState] = useState<string[]>([])

  useEffect(() => {
    const ws = new WebSocket(WS_URI + '/v1.0/console')
    ws.onerror = (ev) => {
      console.warn(ev)
    }
    ws.onmessage = (ev) => {
      setState((state) => [...state, ev.data])
    }
  }, [])

  return (
    <div>
      <div>LOADED</div>

      <br />

      {state.map((msg, i) => (
        <div key={i}>{msg}</div>
      ))}
    </div>
  )
}
