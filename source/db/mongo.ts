// @flow

const mongojs = require("mongojs")
import { DB_URL } from "../globals"
import { GitHubUser } from "./types"

// docs - http://mafintosh.github.io/mongojs/ 

const db = mongojs(`mongodb://${DB_URL}`, ["github_installations"])
const installationsDB = db.github_installations

/** An individual installation of Danger via Peril */
export interface GitHubInstallation {
    id: string
    account: GitHubUser,
    sender: GitHubUser,
    accessToken: string,
    tokenExpires: string
}

export async function saveInstallation(installation: GitHubInstallation) {
  return new Promise((resolve: any, reject: any) => {
    // Insert a new model
    installationsDB.insert(installation, (err, doc) => {
      if (err) { return reject(err) }
      if (doc) { return resolve(doc) }
      })
    })
}

export async function updateInstallation(installation: GitHubInstallation) {
    return new Promise((resolve: any, reject: any) => {
      // Insert a new model
      installationsDB.insert(installation, (err, doc) => {
        if (err) { return reject(err) }
        if (doc) { return resolve(doc) }
      })
    })
}
