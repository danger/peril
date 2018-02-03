import jsonDB from "./json"
import postgres from "./postgres"

import { DatabaseAdaptor } from "./index"

import { DATABASE_JSON_FILE, DATABASE_URL } from "../globals"

let exposedDB: DatabaseAdaptor = null as any
if (DATABASE_JSON_FILE) {
  exposedDB = jsonDB(DATABASE_JSON_FILE as string)
} else if (DATABASE_URL) {
  exposedDB = postgres
} else {
  throw new Error("No DATABASE_JSON_FILE or DATABASE_URL set up in ENV, this is likely an accident.")
}

exposedDB.setup()

export default exposedDB
