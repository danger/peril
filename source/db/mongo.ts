import mongojs from "mongojs"
import { DB_URL } from "../globals"
import { GitHubUser } from "./types"

// docs - http://mafintosh.github.io/mongojs/ 
console.log(DB_URL)
const db = mongojs(`mongodb://${DB_URL}`, ["github_installations"])
const integrationDB = db.github_integrations

export type AuthToken = string

/** An individual integration of Danger via Peril, this is like the org */
export interface GitHubIntegration {
  id: number
  account: GitHubUser,
  sender: GitHubUser,
  accessToken: string,
  tokenExpires: string
}

/** An individual repo installation of Danger via Peril */
export interface GitHubInstallation {
  id: number
  integrationID: string,
  repoSlug: string
}

/** Gets an Integration */
export async function getIntegration(integrationID: number) {
  return new Promise<GitHubIntegration>((resolve: any, reject: any) => {
   integrationDB.findOne({ id: integrationID }, async (err, doc) => {
      if (err) { return reject(err) }
      if (doc) { return resolve(doc) }
    })
  })
}

/** Saves an Integration */
export async function saveIntegration(integration: GitHubIntegration) {
  return new Promise((resolve: any, reject: any) => {
    // Insert a new model
    integrationDB.insert(integration, (err, doc) => {
      if (err) { return reject(err) }
      if (doc) { return resolve(doc) }
    })
  })
}

/** Updates the db */
export async function updateIntegration(installation: GitHubIntegration) {
  return new Promise<GitHubIntegration>((resolve: any, reject: any) => {
    integrationDB.update({ id: installation.id }, { $set: installation }, () => {
      resolve(installation)
    })
  })
}
