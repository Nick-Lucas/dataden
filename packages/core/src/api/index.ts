import express from "express";
import bodyParser from 'body-parser'
import morgan from "morgan";

import { API_PORT, LOG } from "src/config";

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

  app.use(morgan('dev'))
  if (LOG.LOG_BODY) {
    app.use((req, res, next) => {
      console.log("BODY", req.body);
      next();
    });
  }

  app.post<PluginParams, any, PostDataRequest, any>(
    '/v1.0/data/:pluginName', 
    (request, response) => {
      const { pluginName } = request.params
      const body = request.body
      
      datas.push(...body.data)

      response.sendStatus(200)
    }
  )

  app.get<any, GetDataResponse, any, any>(
    '/v1.0/data/:pluginName', 
    (request, response) => {
      const { pluginName } = request.params
      const data = request.body

      response.send({
        data: datas
      })
    }
  )
  
  app.listen(API_PORT)
  console.log("[API] Listening on port", API_PORT)
}
