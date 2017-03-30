import * as winston from "winston"
import { DATABASE_URL } from "../globals"
import { GitHubUser } from "./types"

// Docs: https://github.com/vitaly-t/pg-promise
// Examples: https://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example

import * as pg from "pg-promise"

let db = pg()(DATABASE_URL)

export type AuthToken = string

/** An individual integration of Danger via Peril, this is like the org */
export interface GitHubInstallation {
  /**
   * The ID Integration, this is used when talking to GitHub mainly, but is used
   * as a unique ID in our db
   */
  id: number
  /**
   * In our DB this is represented as a JSON type, so you should always have settings
   * as a nullable type.
   */
  settings: {
    /** Should only org members run Danger? */
    onlyForOrgMembers?: boolean,
    /** Temporary */
    filepathForDangerfile?: string,
  }
}

/** Gets an Integration */
export async function getInstallation(installationID: number): Promise<GitHubInstallation> {
  winston.log("db", `Getting installation with id: ${installationID}`)
  return db.one("select * from installations where id=$1", [installationID])
}

/** Saves an Integration */
export async function saveInstallation(installation: GitHubInstallation) {
  winston.log("db", `Saving installation with id: ${installation.id}`)
  return db.one("insert into installations(id, settings) values($1, $2) returning *",
    [installation.id, installation.settings])
}

/** Updates the db */
export async function updateInstallation(installation: GitHubInstallation) {
  winston.log("db", `Updating installation with id: ${installation.id}`)
  winston.log("db", `Does not do anything`)
  // return db.collection("installations").update({ id: installation.id }, { $set: installation })
}
