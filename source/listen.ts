import chalk from "chalk"
import * as express from "express"

import { ApolloEngine } from "apollo-engine"
import { createServer } from "http"
import * as Primus from "primus"
import { setupPublicWebsocket } from "./api/api"
import { APOLLO_ENGINE_KEY } from "./globals"
import logger from "./logger"

export let primus: any = null

/**
 * A function which either starts the app normally, or starts
 * it wrapped by apollo engine (for tracing and error logging)
 *
 * This is complex:
 *
 * - It creates an Apollo Engine, and a node http server
 * - The http server wraps the express app
 * - Apollo Engine then starts the listening process
 */
export const startApp = (app: express.Express, callback: any) => {
  if (!APOLLO_ENGINE_KEY) {
    app.listen(app.get("port"), callback)
    logger.info("")
    return
  }

  // https://www.apollographql.com/docs/engine/
  const engine = new ApolloEngine({ apiKey: APOLLO_ENGINE_KEY })
  const httpServer = createServer(app as any)

  primus = new Primus(httpServer, { transformer: "websockets", iknowclusterwillbreakconnections: true })
  setupPublicWebsocket()

  // Call engine.listen instead of app.listen(port)
  engine.listen({ port: app.get("port"), httpServer }, () => {
    callback()

    const tick = chalk.bold.greenBright("✓")
    logger.info("  - " + tick + " Apollo Engine")
    logger.info("  - " + tick + " Primus Sockets")
  })
}
