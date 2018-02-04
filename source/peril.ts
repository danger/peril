import * as bodyParser from "body-parser"
import * as express from "express"
import * as xhub from "express-x-hub"

import {
  HYPER_ACCESS_KEY,
  HYPER_FUNC_NAME,
  MONGODB_URI,
  PERIL_WEBHOOK_SECRET,
  PUBLIC_FACING_API,
  validateENVForPerilServer,
} from "./globals"

import prDSLRunner from "./api/pr/dsl"
import logger from "./logger"
import { hyperUpdater } from "./routing/hyper_updater"
import webhook from "./routing/router"
import startScheduler from "./scheduler/startScheduler"
import { startTaskScheduler } from "./tasks/startTaskScheduler"

const peril = () => {
  validateENVForPerilServer()

  // Error logging
  process.on("unhandledRejection", (reason: string, _: any) => {
    logger.error("Error: ", reason)
    throw reason
  })

  const app = express()
  app.set("port", process.env.PORT || 5000)
  app.set("view engine", "ejs")
  app.use(xhub({ algorith: "sha1", secret: PERIL_WEBHOOK_SECRET }))
  app.use(bodyParser.json())
  app.use(express.static("public"))

  app.post("/webhook", webhook)

  if (MONGODB_URI) {
    logger.info("Starting up the task scheduler.")
    startTaskScheduler()
  }

  if (PUBLIC_FACING_API) {
    logger.info("This is a public facing Peril instance.")
    app.get("/api/v1/pr/dsl", prDSLRunner)
  }

  if (HYPER_ACCESS_KEY) {
    // You need to set up a dockerhub webhook that is your peril address
    // with you hyper access key as a secret for your URL.
    //
    // This is mainly so you don't need to remember to do a `hyper pull` after
    // an update.
    app.get(`/api/v1/webook/dockerhub/${HYPER_ACCESS_KEY}`, hyperUpdater)
  }

  // Start server
  app.listen(app.get("port"), () => {
    logger.info(`Started server at http://localhost:${process.env.PORT || 5000}`)
    startScheduler()
  })
}

export default peril
