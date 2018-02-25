// TODO: Is this too fancy and needs fixing?
// e.g. having a get db function
//

import logger from "../logger"
import jsonDB from "./json"
import mongo from "./mongo"

import { DatabaseAdaptor } from "./index"

import { DATABASE_JSON_FILE, DATABASE_URL } from "../globals"

let exposedDB: DatabaseAdaptor = null as any
if (DATABASE_JSON_FILE) {
  logger.info(`Using ${DATABASE_JSON_FILE} as a JSON db`)
  exposedDB = jsonDB(DATABASE_JSON_FILE)
} else if (DATABASE_URL) {
  logger.info(`Using ${DATABASE_URL} as the mongo db`)
  exposedDB = mongo
}

if (exposedDB) {
  exposedDB.setup()
}

export default exposedDB
