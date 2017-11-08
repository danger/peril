import * as cluster from "cluster"
import * as os from "os"

import logger from "./logger"
import peril from "./peril"

const WORKERS = process.env.NODE_ENV === "production" ? process.env.WEB_CONCURRENCY || os.cpus().length : 1

if (cluster.isMaster) {
  logger.info(`[CLUSTER] Master cluster setting up ${WORKERS} workers...`)
  for (let i = 0; i < WORKERS; i++) {
    cluster.fork() // create a worker
  }

  cluster.on("online", worker => {
    logger.info(`[CLUSTER] Worker ${worker.process.pid} is online`)
  })

  cluster.on("exit", (worker, code, signal) => {
    logger.info(`[CLUSTER] Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
    logger.info("[CLUSTER] Starting a new worker")
    // start a new worker when it crashes
    cluster.fork()
  })
} else {
  peril()
}
