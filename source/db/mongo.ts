// import mongojs from "mongojs"
import * as debug from "debug"
import { Db, MongoClient } from "mongodb"
import { DB_URL } from "../globals"
import { GitHubUser } from "./types"

const d = debug("peril:db")
d.enabled = true

let db: Db
const setup = async () => {
  db = await MongoClient.connect(`mongodb://${DB_URL}/peril`)
}
setup()

export type AuthToken = string

/** An individual integration of Danger via Peril, this is like the org */
export interface GitHubInstallation {
  id: number
  account: GitHubUser,
  sender: GitHubUser,
  onlyForOrgMembers: boolean,
  filepathForDangerfile: string
}

/** Gets an Integration */
export async function getInstallation(installationID: number) {
  d(`Getting installation with id: ${installationID}`)
  return db.collection("installations").findOne({ id: installationID })
}

/** Saves an Integration */
export async function saveInstallation(installation: GitHubInstallation) {
  d(`Saving installation with id: ${installation.id}`)
  return db.collection("installations").insert(installation)
}

/** Updates the db */
export async function updateInstallation(installation: GitHubInstallation) {
  d(`Updating installation with id: ${installation.id}`)
  return db.collection("installations").update({ id: installation.id }, { $set: installation })
}
