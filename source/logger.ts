import * as winston from "winston"

const logger = winston
require("winston-papertrail").Papertrail // tslint:disable-line

import { PAPERTRAIL_PORT, PAPERTRAIL_URL } from "./globals"

if (PAPERTRAIL_URL !== null) {

  // Adds papertrail to the logging systems
  const transports = winston.transports as any
  winston.add(transports.Papertrail, {
    host: PAPERTRAIL_URL,
    port: parseInt(PAPERTRAIL_PORT, 10),
  })

} else {
  console.log("Skipping papertrail setup for winston.") // tslint:disable-line
}

export default logger
