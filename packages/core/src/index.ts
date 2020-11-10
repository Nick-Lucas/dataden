import * as dotenv from "dotenv";

import { OK } from "./db";

const env = dotenv.config()
if (env.error) {
  console.error("[dotenv]", env.error)
  throw env.error
}

console.log(process.env.MONGO_URI)

console.log("Hello World!!", OK)

let i = 0
setInterval(() => {
  console.log("Hi, again! " + i++)
}, 1000)
