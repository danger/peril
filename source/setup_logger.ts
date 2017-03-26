import * as winston from "winston"

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
  winston.debug("Skipping papertrail setup.") // tslint:disable-line
}
