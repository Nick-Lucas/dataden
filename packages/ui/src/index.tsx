import React from 'react'
import ReactDOM from 'react-dom'
import { QueryClientProvider, QueryClient } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { QueryParamProvider } from 'use-query-params'

import './index.css'
import 'antd/dist/antd.css'
import './config'

import type {} from 'styled-components/cssprop'

import { App } from './App'
import reportWebVitals from './reportWebVitals'

// import * as types from 'styled-components/cssprop'
// import 'styled-components/cssprop'
// import { CSSProp } from 'styled-components'
// declare global {
//   namespace JSX {
//     interface IntrinsicAttributes {
//       css?: CSSProp
//     }
//   }
// }

const queryClient = new QueryClient()

ReactDOM.render(
  // <React.StrictMode>
  <QueryParamProvider>
    <QueryClientProvider client={queryClient}>
      <App />

      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  </QueryParamProvider>,
  // </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
