import * as winston from "winston"

const logger = winston
require("winston-papertrail").Papertrail // tslint:disable-line

import { PAPERTRAIL_PORT, PAPERTRAIL_URL } from "./globals"

// Optional, adds papertrail to the logging systems
if (PAPERTRAIL_URL) {
  const transports = winston.transports as any
  winston.add(transports.Papertrail, {
    host: PAPERTRAIL_URL,
    port: parseInt(PAPERTRAIL_PORT as string, 10),
  })
}

export default logger
