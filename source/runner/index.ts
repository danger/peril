import * as getSTDIN from "get-stdin"
import logger from "../logger"
import { run } from "./run"

// Inside Hyper the dockerfile's process.env is:
// {
//   HOME: "/root",
//   PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
//   HOSTNAME: "85592a9be410",
//   host: "us-west-1.hyperfunc.io",
//   connection: "close",
//   content_type: "application/json",
//   x_hyper_content_sha256: "43e004873ea99b5a651e8873ec1677532a02f7e0b7b56b03cb734ec498104ba8",
//   accept: "*/*",
//   accept_encoding: "gzip,deflate",
//   LOG_FETCH_REQUESTS: 'true',
//   COMMIT: "XXXYYZZZ",
//   x_hyper_date: "20180520T014347Z",
//   x_forwarded_for: "52.53.215.111",
//   NODE_VERSION: "9.11.1",
//   YARN_VERSION: "1.5.1",
//   content_length: "20941",
//   authorization:
//     "HYPER-HMAC-SHA256 Credential=XYZ/20180520/us-west-1/hyper/hyper_request, SignedHeaders=content-type;host;x-hyper-content-sha256;x-hyper-date, Signature=ZZZ",
//   user_agent: "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)",
// }

// Log that the process has started, and on what commit
logger.info(`☢️ ${process.env.SOURCE_COMMIT}`)

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
