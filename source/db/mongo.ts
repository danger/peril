import mongojs from "mongojs"
import { DB_URL } from "../globals"
import { GitHubUser } from "./types"

// docs - http://mafintosh.github.io/mongojs/

const db = mongojs(`mongodb://${DB_URL}/peril`, ["github_installations"])
const installations = db.github_installations

export type AuthToken = string

/** An individual integration of Danger via Peril, this is like the org */
export interface GitHubInstallation {
  id: number
  account: GitHubUser,
  sender: GitHubUser,
  accessToken: string,
  tokenExpires: string,
  onlyForOrgMembers?: string | null,
  filepathForDangerfile?: string
}

/** Gets an Integration */
export async function getInstallation(installationID: number) {
  return new Promise<GitHubInstallation>((resolve: any, reject: any) => {
   installations.findOne({ id: installationID }, async (err, doc) => {
      if (err) { return reject(err) }
      if (doc) { return resolve(doc) }
    })
  })
}

/** Saves an Integration */
export async function saveInstallation(installation: GitHubInstallation) {
  return new Promise((resolve: any, reject: any) => {
    // Insert a new model
    installations.insert(installation, (err, doc) => {
      if (err) { return reject(err) }
      if (doc) { return resolve(doc) }
    })
  })
}

/** Updates the db */
export async function updateInstallation(installation: GitHubInstallation) {
  return new Promise<GitHubInstallation>((resolve: any, reject: any) => {
    installations.update({ id: installation.id }, { $set: installation }, () => {
      resolve(installation)
    })
  })
}
