import nodeCleanup = require("node-cleanup")
import logger from "../logger"

logger.info(".")

import { run } from "./run"

const foundDSL = false

logger.info("0.")

// Wait till the end of the process to print out the results. Will
// only post the results when the process has succeeded, leaving the
// host process to create a message from the logs.
nodeCleanup((exitCode, signal) => {
  logger.info(`Process has finished with ${exitCode} ${signal}`)

  // TODO: Failure cases?
  logger.info("TODO")
  // runtimeEnv.results

  return undefined
})

logger.info("1.")

// Add a timeout so that CI doesn't run forever if something has broken.
setTimeout(() => {
  logger.info("In the setTimeout")
  if (!foundDSL) {
    logger.error("Timeout: Failed to get the Peril DSL after 2 seconds")
    process.exitCode = 1
    process.exit(1)
  }
}, 2000)

logger.info("Waiting on the STDIN now.")
import { readFileSync } from "fs"
const stdin1 = readFileSync("/dev/stdin").toString()

logger.info("Got 1:", stdin1)
run(stdin1)
