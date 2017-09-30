import { GitHubInstallationSettings } from "./GitHubRepoSettings"
import jsonDB from "./json"
import postgres from "./postgres"

import { DatabaseAdaptor } from "./index"

import { DATABASE_JSON_FILE, DATABASE_URL } from "../globals"

let exposedDB: DatabaseAdaptor = null as any
if (DATABASE_JSON_FILE) {
  exposedDB = jsonDB(DATABASE_JSON_FILE as string)
} else {
  exposedDB = postgres
}

exposedDB.setup()

export default exposedDB
