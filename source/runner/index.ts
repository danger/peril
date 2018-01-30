import * as getSTDIN from "get-stdin"
import nodeCleanup = require("node-cleanup")

import logger from "../logger"

import { run } from "./run"

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

// Start waiting on STDIN for the DSL
getSTDIN().then(run)
