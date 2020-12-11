import React from 'react'
import ReactDOM from 'react-dom'
import { ReactQueryCacheProvider, QueryCache } from 'react-query'
import { ReactQueryDevtools } from 'react-query-devtools'

import './index.css'
import 'antd/dist/antd.css'

import type {} from 'styled-components/cssprop'

import { App } from './App'
import reportWebVitals from './reportWebVitals'

const queryCache = new QueryCache()

ReactDOM.render(
  <React.StrictMode>
    <ReactQueryCacheProvider queryCache={queryCache}>
      <App />

      <ReactQueryDevtools position="bottom-right" />
    </ReactQueryCacheProvider>
  </React.StrictMode>,
  document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
