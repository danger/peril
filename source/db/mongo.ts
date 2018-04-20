import * as debug from "debug"
import * as JSON5 from "json5"

import { connect, Document, model, Schema } from "mongoose"

import { dangerRepresentationForPath } from "../danger/danger_run"
import { getGitHubFileContentsWithoutToken } from "../github/lib/github_helpers"
import { MONGODB_URI } from "../globals"
import { DatabaseAdaptor, GitHubInstallation, PerilInstallationSettings } from "./index"
import { partialInstallationToInstallation } from "./json"

const d = debug("peril:mongo")

/**
 * Basically the same thing as a PerilInstallationSettings but coming from the database
 */
export interface MongoGithubInstallationModel extends Document, PerilInstallationSettings {}

const Installation = model<MongoGithubInstallationModel>(
  "GithubInstallation",
  new Schema({
    iID: Number,
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
    d(`Saving installation with id: ${installation.iID}`)
    const dbInstallation = await Installation.findOne({ installationID: installation.iID })
    if (dbInstallation) {
      await dbInstallation.update(installation)
    } else {
      const newInstallation = new Installation(installation)
      await newInstallation.save()
    }
  },

  /** Gets an Integration */
  getInstallation: async (installationID: number): Promise<GitHubInstallation | null> => {
    const dbInstallation = await Installation.findOne({ installationID })
    return dbInstallation
  },

  /** Deletes an Integration */
  updateInstallation: async (installationID: number) => {
    const dbInstallation = await Installation.findOne({ installationID })
    if (!dbInstallation) {
      d.log(`Could not get a db reference for installation ${installationID} when updating`)
      return
    }

    if (!dbInstallation.dangerfilePath) {
      d.log(`Could not get installation ${installationID} did not have a dangerfilePath when updating`)
      return
    }

    const pathRep = dangerRepresentationForPath(dbInstallation.dangerfilePath)

    if (!pathRep.repoSlug || !pathRep.dangerfilePath) {
      d.log(`DangerfilePath for ${installationID} did not have a repoSlug/dangerfilePath when updating`)
      return
    }

    const file = await getGitHubFileContentsWithoutToken(pathRep.repoSlug, pathRep.dangerfilePath)
    if (file === "") {
      d.log(`Settings for ${installationID} at ${dbInstallation.dangerfilePath} were empty`)
      return
    }

    const parsedSettings = JSON5.parse(file) as Partial<GitHubInstallation>
    const installation = partialInstallationToInstallation(parsedSettings, dbInstallation.dangerfilePath)
    return await Installation.updateOne({ installationID }, installation)
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
