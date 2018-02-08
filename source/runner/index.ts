// @ts-ignore
// tslint:disable-next-line:no-var-requires
const Module = require("module")

const oldRequire = Module.prototype.require

Module.prototype.require = function(id: string) {
  const ts = process.hrtime()
  const res = oldRequire.call(this, id)
  const t = process.hrtime(ts)
  // tslint:disable-next-line:no-console
  console.log("require('%s') took %s ms", id, t[0] * 1000 + t[1] / 1e6)
  return res
}

import * as getSTDIN from "get-stdin"
import nodeCleanup = require("node-cleanup")

try {
  // tslint:disable-next-line:no-var-requires
  const logger = require("../logger").default
  logger.info("Started Runner")

  // We do not trust that the import paths will not provide errors
  // this is my fault for being too smart, and can slowly get fixed in the
  // future. Today however, running Peril's runner in the process
  // with no env vars can be drastically different, and cause unforeseen crashes
  // which don't show up in hyper.
  //
  // So we catch all errors, and thus the upcoming require instead of an import.

  // tslint:disable-next-line:no-var-requires
  const run = require("./run").run
  logger.info("Getting STDIN")

  // Provide a timeout mechanism for the STDIN from the hyper func host
  let foundDSL = false
  getSTDIN().then(stdin => {
    foundDSL = true
    run(stdin)
  })

  // Wait till the end of the process to print out the results. Will
  // only post the results when the process has succeeded, leaving the
  // host process to create a message from the logs.
  nodeCleanup((exitCode, signal) => {
    logger.info(`Process has finished with ${exitCode} ${signal}`)

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
  }, 2000)
} catch (error) {
  const err = error as Error
  // tslint:disable-next-line:no-var-requires
  const logger = require("../logger").default
  logger.error(`Error ${err.name} in the runner: ${err.message}\n${err.stack}`)
  throw error
}
