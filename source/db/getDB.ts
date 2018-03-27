import logger from "../logger"
import jsonDB from "./json"
import mongo from "./mongo"

import { DATABASE_JSON_FILE, MONGODB_URI } from "../globals"

const isJest = typeof jest !== "undefined"

export const getDatabaseForEnv = (env: any) => {
  if (env.DATABASE_JSON_FILE || isJest) {
    const json = jsonDB(env.DATABASE_JSON_FILE)
    json.setup()
    return json
  }

  if (env.MONGODB_URI) {
    if (!isJest) {
      mongo.setup()
    }
    return mongo
  }

  return null
}

/** Gets the Current DB for this runtime environment */
export const getDB = () => {
  if (DATABASE_JSON_FILE || MONGODB_URI) {
    if (!isJest) {
      if (DATABASE_JSON_FILE) {
        logger.info(`Using ${DATABASE_JSON_FILE} as a JSON db`)
      } else {
        logger.info(`Using ${MONGODB_URI} as the mongo db`)
      }
    }
  }

  const db = getDatabaseForEnv(process.env)
  if (!db) {
    throw new Error("No default DB was set up")
  }
  return db
}
