import * as getSTDIN from "get-stdin"
import logger from "../logger"
import { run } from "./run"

// Log that the process has started, and on what commit
logger.info(`☢️ Peril at ${process.env.COMMIT_SHA}`)

// Empty the auth ENV VAR before running code
process.env.authorization = ""

try {
  // Provide a timeout mechanism for the STDIN from the hyper func host
  let foundDSL = false
  getSTDIN().then(stdin => {
    foundDSL = true
    run(stdin)
  })

  process.on("unhandledRejection", (error: Error) => {
    logger.error("unhandledRejection:", error.message, error.stack)
    process.exitCode = 1
  })

  // Add a timeout so that CI doesn't run forever if something has broken.
  setTimeout(() => {
    if (!foundDSL) {
      logger.error("Timeout: Failed to get the Peril DSL after 5 seconds")
      process.exitCode = 1
      process.exit(1)
    }
  }, 5000)
} catch (error) {
  const err = error as Error
  logger.error(`Error ${err.name} in the runner: ${err.message}\n${err.stack}`)
  throw error
}
