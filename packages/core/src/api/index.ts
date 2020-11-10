import express from "express";
import bodyParser from 'body-parser'

import { API_PORT } from "src/config";

let datas = [] as object[]

interface PluginParams {
  pluginName: string
}

interface PostDataRequest {
  mode: "append" | "replace",
  data: object[],
  lastDate: Date
}

interface GetDataResponse {
  data: object[]
}

export function start() {
  const app = express()

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())


  app.post<PluginParams, any, PostDataRequest, any>(
    '/v1.0/data/:pluginName', 
    (request, response) => {
      const { pluginName } = request.params
      const body = request.body
      console.log(request)
      console.log("POST [DATA]", { pluginName, body })

      datas.push(...body.data)

      response.sendStatus(200)
    }
  )

  app.get<any, GetDataResponse, any, any>(
    '/v1.0/data/:pluginName', 
    (request, response) => {
      const { pluginName } = request.params
      const data = request.body

      console.log("POST [DATA]", { pluginName, data })

      response.send({
        data: datas
      })
    }
  )
  
  app.listen(API_PORT)
  console.log("[API] Listening on port", API_PORT)
}
