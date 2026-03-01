import * as cluster from "cluster"
import * as os from "os"

import logger from "./logger"
import { peril } from "./peril"

const WORKERS = process.env.NODE_ENV === "production" ? process.env.WEB_CONCURRENCY || os.cpus().length : 1
const log = (message: string) => {
  if (WORKERS > 1) {
    logger.info(message)
  }
}

if (cluster.isMaster) {
  log(`[CLUSTER] Master cluster setting up ${WORKERS} workers...`)
  for (let i = 0; i < WORKERS; i++) {
    cluster.fork() // create a worker
  }

  cluster.on("online", worker => {
    log(`[CLUSTER] Worker ${worker.process.pid} is online`)
  })

  cluster.on("exit", (worker, code, signal) => {
    log(`[CLUSTER] Worker ${worker.process.pid} died with code: ${code}, and signal: ${signal}`)
    log("[CLUSTER] Starting a new worker")
    // start a new worker when it crashes
    cluster.fork()
  })
} else {
  peril()
}
