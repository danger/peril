import * as winston from "winston"

const logger = winston
require("winston-papertrail").Papertrail // tslint:disable-line

import { PAPERTRAIL_PORT, PAPERTRAIL_URL } from "./globals"

const isJest = typeof jest !== "undefined"

// Optionall adds papertrail to the logging systems
if (PAPERTRAIL_URL) {
  const transports = winston.transports as any
  winston.add(transports.Papertrail, {
    host: PAPERTRAIL_URL,
    port: parseInt(PAPERTRAIL_PORT as string, 10),
  })
} else if (!isJest) {
  console.log("Skipping papertrail setup for winston.") // tslint:disable-line
}

export default logger
