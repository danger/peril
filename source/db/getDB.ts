// TODO: Is this too fancy and needs fixing?
// e.g. having a get db function
//

import logger from "../logger"
import jsonDB from "./json"
import postgres from "./postgres"

import { DatabaseAdaptor } from "./index"

import { DATABASE_JSON_FILE, DATABASE_URL } from "../globals"

let exposedDB: DatabaseAdaptor = null as any
if (DATABASE_JSON_FILE) {
  logger.info(`Using ${DATABASE_JSON_FILE} as a JSON db`)
  exposedDB = jsonDB(DATABASE_JSON_FILE)
} else if (DATABASE_URL) {
  logger.info(`Using ${DATABASE_URL} as a postgres db`)
  exposedDB = postgres
} else {
  logger.info(`Throwing due to db accessed without ENV vars`)
  throw new Error("No DATABASE_JSON_FILE or DATABASE_URL set up in ENV, this is likely an accident.")
}

exposedDB.setup()

export default exposedDB
