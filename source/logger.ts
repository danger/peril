import * as winston from "winston"

const logger = winston
require("winston-papertrail").Papertrail // tslint:disable-line

import { PAPERTRAIL_PORT, PAPERTRAIL_URL } from "./globals"

// Optionall adds papertrail to the logging systems
if (PAPERTRAIL_URL) {
  const transports = winston.transports as any
  winston.add(transports.Papertrail, {
    host: PAPERTRAIL_URL,
    port: parseInt(PAPERTRAIL_PORT, 10),
  })
} else {
  console.log("Skipping papertrail setup for winston.") // tslint:disable-line
}

export default logger
