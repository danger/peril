import "babel-polyfill"
import * as bodyParser from "body-parser"
import chalk from "chalk"
import * as express from "express"
import * as xhub from "express-x-hub"

import { startApp } from "./listen"

import {
  DATABASE_JSON_FILE,
  HYPER_ACCESS_KEY,
  MONGODB_URI,
  PAPERTRAIL_URL,
  PERIL_WEBHOOK_SECRET,
  PUBLIC_API_ROOT_URL,
  PUBLIC_FACING_API,
  PUBLIC_WEB_ROOT_URL,
  SENTRY_DSN,
  validateENVForPerilServer,
  WEB_CONCURRENCY,
} from "./globals"

import { init } from "@sentry/node"
import { URL } from "url"
import { setupPublicAPI } from "./api/api"
import logger from "./logger"
import { hyperUpdater } from "./routing/hyper_updater"
import { githubRouter } from "./routing/router"
import { startTaskScheduler } from "./tasks/startTaskScheduler"

const welcomeMessages = [] as string[]
export const tick = chalk.bold.greenBright("✓")
export const cross = chalk.bold.redBright("ⅹ")

export const peril = () => {
  validateENVForPerilServer()

  // Error logging
  process.on("unhandledRejection", (reason: string, _: any) => {
    logger.error("UnhandledRejection Error: ", reason)
    throw reason
  })

  const app = express()
  app.set("port", process.env.PORT || 5000)
  app.use(xhub({ algorith: "sha1", secret: PERIL_WEBHOOK_SECRET }))
  app.use(bodyParser.json())
  app.use(express.static("public"))

  app.post("/webhook", githubRouter)

  welcomeMessages.push("☢️  Starting up Peril")

  const paperTrail = PAPERTRAIL_URL ? tick : cross
  welcomeMessages.push(paperTrail + " Papertrail")

  const clustering = WEB_CONCURRENCY ? tick : cross
  welcomeMessages.push(clustering + " Clustering")

  if (MONGODB_URI) {
    const uri = new URL(MONGODB_URI)
    welcomeMessages.push(tick + ` Mongo at ${uri.host}`)
  } else {
    welcomeMessages.push(tick + ` JSON Db at ${DATABASE_JSON_FILE}`)
  }

  if (SENTRY_DSN) {
    // Set up Sentry first
    init({ dsn: SENTRY_DSN })
    welcomeMessages.push(tick + ` Sentry`)
  }

  if (MONGODB_URI) {
    welcomeMessages.push(tick + " Task Scheduler")
    startTaskScheduler()
  }

  if (HYPER_ACCESS_KEY) {
    // You need to set up a dockerhub webhook that is your peril address
    // with you hyper access key as a secret for your URL.
    //
    // This is mainly so you don't need to remember to do a `hyper pull` after
    // an update to Peril.
    const url = `/api/v1/webhook/dockerhub/${HYPER_ACCESS_KEY}`
    welcomeMessages.push(tick + " Hyper Sandbox")
    welcomeMessages.push(tick + " Docker Webhook")
    app.post(url, hyperUpdater)
  }
  const port = process.env.PORT || 5000

  // This should go last
  if (PUBLIC_FACING_API) {
    welcomeMessages.push(tick + " Public API:")
    welcomeMessages.push(`  - Web Root: ${PUBLIC_WEB_ROOT_URL}`)
    welcomeMessages.push(`  - API Root: ${PUBLIC_API_ROOT_URL}`)
    welcomeMessages.push(`  - GraphQL : http://localhost:${port}/api/graphql`)
    welcomeMessages.push(`  - GraphiQL: http://localhost:${port}/api/graphiql`)
    setupPublicAPI(app)
  }

  // Start server
  startApp(app, () => {
    if (!process.env.HEROKU || !process.env.NOW) {
      welcomeMessages.push(tick + " Server:")
      welcomeMessages.push(`  - Local: http://localhost:${port}`)
    }
    welcomeMessages.forEach(l => logger.info(l))
  })
}
