import * as bodyParser from "body-parser"
import * as express from "express"
import * as xhub from "express-x-hub"

import { PERIL_WEBHOOK_SECRET, PUBLIC_FACING_API } from "./globals"

import prDSLRunner from "./api/pr/dsl"
import logger from "./logger"
import webhook from "./routing/router"
import startScheduler from "./scheduler/startScheduler"

const peril = () => {
  // Error logging
  process.on("unhandledRejection", (reason: string, p: any) => {
    console.log("Error: ", reason) // tslint:disable-line
    throw reason
  })

  const app = express()
  app.set("port", process.env.PORT || 5000)
  app.set("view engine", "ejs")
  app.use(xhub({ algorith: "sha1", secret: PERIL_WEBHOOK_SECRET }))
  app.use(bodyParser.json())
  app.use(express.static("public"))

  app.post("/webhook", webhook)

  if (PUBLIC_FACING_API) {
    console.log("This is a public facing Peril instance.") // tslint:disable-line
    app.get("/api/v1/pr/dsl", prDSLRunner)
  }

  // Start server
  app.listen(app.get("port"), () => {
    logger.info(`Started server at http://localhost:${process.env.PORT || 5000}`) // tslint:disable-line
    startScheduler()
  })
}

export default peril
