import * as debug from "debug"
import { pick } from "lodash"
import { connect, Document, model, Schema } from "mongoose"

import { MONGODB_URI } from "../globals"
import { DatabaseAdaptor, GitHubInstallation } from "./index"

const d = debug("peril:mongo")

export interface MongoGithubInstallationModel extends Document {
  installationID: number
  settings: any
  tasks: any
  repos: any
  rules: any
}
const rootSettings = ["settings", "repos", "tasks", "rules", "scheduler"]

export const ghToMongo = (gh: GitHubInstallation): MongoGithubInstallationModel => ({
  installationID: gh.id,
  ...(pick(gh, rootSettings) as any),
})

export const mongoToGH = (mongo: MongoGithubInstallationModel): GitHubInstallation => ({
  id: mongo.installationID,
  ...(pick(mongo, rootSettings) as any),
})

const Installation = model<MongoGithubInstallationModel>(
  "GithubInstallation",
  new Schema({
    // Need to convert from id to installationID
    installationID: Number,
    settings: Schema.Types.Mixed,
    tasks: Schema.Types.Mixed,
    repos: Schema.Types.Mixed,
    rules: Schema.Types.Mixed,
  })
)

const database: DatabaseAdaptor = {
  setup: async () => {
    await connect(MONGODB_URI)
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
