import { Db, MongoClient } from "mongodb"
import * as winston from "winston"
import { DATABASE_URL } from "../globals"
import { GitHubUser } from "./types"

// Docs: https://github.com/vitaly-t/pg-promise
// Examples: https://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example

import * as pg from "pg-promise"

let db = pg()(DATABASE_URL)

// const db = require('pg-promise')(); // // tslint:disable-line

export type AuthToken = string

/** An individual integration of Danger via Peril, this is like the org */
export interface GitHubInstallation {
  id: number
  settings: {
    onlyForOrgMembers?: boolean,
    filepathForDangerfile?: string,
  }
}

/** Gets an Integration */
export async function getInstallation(installationID: number) {
  winston.log("mongo", `Getting installation with id: ${installationID}`)
  return db.one("select * from installations where id=$1", [installationID])
}

/** Saves an Integration */
export async function saveInstallation(installation: GitHubInstallation) {
  winston.log("mongo", `Saving installation with id: ${installation.id}`)
  return db.one("insert into installations(id, settings) values($1, $2) returning *",
    [installation.id, installation.settings])
}

/** Updates the db */
export async function updateInstallation(installation: GitHubInstallation) {
  winston.log("mongo", `Updating installation with id: ${installation.id}`)
  winston.log("mongo", `Does not do anything`)
  // return db.collection("installations").update({ id: installation.id }, { $set: installation })
}
