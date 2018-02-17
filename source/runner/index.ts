import * as getSTDIN from "get-stdin"
import nodeCleanup = require("node-cleanup")
import logger from "../logger"
import { run } from "./run"

try {
  logger.info("Started Runner")

  // Provide a timeout mechanism for the STDIN from the hyper func host
  let foundDSL = false
  getSTDIN().then(stdin => {
    foundDSL = true
    run(stdin)
  })

  // Wait till the end of the process to print out the results. Will
  // only post the results when the process has succeeded, leaving the
  // host process to create a message from the logs.
  nodeCleanup(exitCode => {
    logger.info(`Process has finished with ${exitCode}`)

    // TODO: Failure cases?
    // logger.info("TODO")
    // runtimeEnv.results

    return undefined
  })

  process.on("unhandledRejection", (error: Error) => {
    logger.error("unhandledRejection:", error.message, error.stack)
    process.exitCode = 1
  })

  // Add a timeout so that CI doesn't run forever if something has broken.
  setTimeout(() => {
    if (!foundDSL) {
      logger.error("Timeout: Failed to get the Peril DSL after 2 seconds")
      process.exitCode = 1
      process.exit(1)
    }
  }, 5000)
} catch (error) {
  const err = error as Error
  logger.error(`Error ${err.name} in the runner: ${err.message}\n${err.stack}`)
  throw error
}
