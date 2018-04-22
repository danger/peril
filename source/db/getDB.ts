import logger from "../logger"
import jsonDB from "./json"
import mongo from "./mongo"

import { DatabaseAdaptor } from "."
import { DATABASE_JSON_FILE } from "../globals"

const isJest = typeof jest !== "undefined"

const getDatabaseForEnv = (env: any) => {
  if (env.DATABASE_JSON_FILE || isJest) {
    logger.info(`Using ${DATABASE_JSON_FILE} as a JSON db`)

    const json = jsonDB(env.DATABASE_JSON_FILE)
    json.setup()
    return json
  }

  if (env.MONGODB_URI) {
    if (!isJest) {
      logger.info(`Using mongo db`)
      mongo.setup()
    }
    return mongo
  }

  return null
}

let db: DatabaseAdaptor | null = null
/** Gets the Current DB for this runtime environment */
export const getDB = () => {
  if (!db) {
    db = getDatabaseForEnv(process.env)
  }

  if (!db) {
    throw new Error("No default DB was set up")
  }

  return db
}
