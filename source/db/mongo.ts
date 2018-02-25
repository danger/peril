import { pick } from "lodash"
import { DATABASE_URL } from "../globals"

import * as debug from "debug"
const d = debug("peril:mongo")

import { DatabaseAdaptor, GitHubInstallation } from "./index"

import * as mongoose from "mongoose"

export interface MongoGithubInstallationModel extends mongoose.Document {
  installationID: number
  settings: any
  tasks: any
  repos: any
  rules: any
}

export const ghToMongo = (gh: GitHubInstallation): MongoGithubInstallationModel => ({
  installationID: gh.id,
  ...(pick(gh, ["settings", "repos", "tasks", "rules", "scheduler"]) as any),
})

export const mongoToGH = (mongo: MongoGithubInstallationModel): GitHubInstallation => ({
  id: mongo.installationID,
  ...(pick(mongo, ["settings", "repos", "tasks", "rules", "scheduler"]) as any),
})

const Installation = mongoose.model<MongoGithubInstallationModel>(
  "GithubInstallation",
  new mongoose.Schema({
    // Need to convert from id to installationID
    installationID: Number,
    settings: mongoose.Schema.Types.Mixed,
    tasks: mongoose.Schema.Types.Mixed,
    repos: mongoose.Schema.Types.Mixed,
    rules: mongoose.Schema.Types.Mixed,
  })
)

const database: DatabaseAdaptor = {
  setup: async () => {
    await mongoose.connect(DATABASE_URL)
  },

  /** Saves an Integration */
  saveInstallation: async (installation: GitHubInstallation) => {
    d(`Saving installation with id: ${installation.id}`)
    const dbInstallation = await Installation.findOne({ installationID: installation.id })
    if (dbInstallation) {
      await dbInstallation.update(ghToMongo(installation))
    } else {
      const newInstallation = new Installation(ghToMongo(installation))
      await newInstallation.save()
    }
  },

  /** Gets an Integration */
  getInstallation: async (installationID: number): Promise<GitHubInstallation | null> => {
    const dbInstallation = await Installation.findOne({ installationID })
    return dbInstallation && mongoToGH(dbInstallation)
  },

  /** Deletes an Integration */
  deleteInstallation: async (installationID: number) => {
    const dbInstallation = await Installation.findOne({ installationID })
    if (dbInstallation) {
      await dbInstallation.remove()
    }
  },
}

export default database
