import chalk from "chalk"
import * as express from "express"

import { ApolloEngine } from "apollo-engine"
import { APOLLO_ENGINE_KEY } from "./globals"

/**
 * A function which either starts the app normally, or starts
 * it wrapped by apollo engine (for tracing and error logging)
 */
export const startApp = (app: express.Express, callback: any) => {
  if (!APOLLO_ENGINE_KEY) {
    app.listen(app.get("port"), callback)
    return
  }

  // https://www.apollographql.com/docs/engine/
  const engine = new ApolloEngine({ apiKey: APOLLO_ENGINE_KEY })

  // Call engine.listen instead of app.listen(port)
  engine.listen({ port: app.get("port"), expressApp: app }, () => {
    callback()

    const tick = chalk.bold.greenBright("✓")
    // tslint:disable-next-line:no-console
    console.log("  - " + tick + " Apollo Engine")
  })
}
