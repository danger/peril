import * as debug from "debug"
import * as JSON5 from "json5"

import { connect, Document, model, Schema } from "mongoose"

import { dangerRepresentationForPath } from "../danger/danger_run"
import { getGitHubFileContentsWithoutToken } from "../github/lib/github_helpers"
import { MONGODB_URI } from "../globals"
import { GitHubInstallation, PerilInstallationSettings } from "./index"
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
    perilSettingsJSONURL: String,
    settings: Schema.Types.Mixed,
    tasks: Schema.Types.Mixed,
    repos: Schema.Types.Mixed,
    rules: Schema.Types.Mixed,
  })
)

const database = {
  setup: async () => {
    await connect(MONGODB_URI)
  },

  /** Saves an Integration */
  saveInstallation: async (installation: Partial<GitHubInstallation>) => {
    d(`Saving installation with id: ${installation.iID}`)
    const dbInstallation = await Installation.findOne({ iID: installation.iID })
    if (dbInstallation) {
      await dbInstallation.update({ iID: installation.iID }, installation)
    } else {
      const newInstallation = new Installation(installation)
      await newInstallation.save()
    }
  },

  /** Gets an Integration */
  getInstallation: async (installationID: number): Promise<GitHubInstallation | null> => {
    const dbInstallation = await Installation.findOne({ iID: installationID })
    return dbInstallation
  },

  /** Gets a set of Integrations */
  getInstallations: async (installationID: number[]): Promise<GitHubInstallation[]> => {
    const dbInstallations = await Installation.where("iID").in(installationID)
    return dbInstallations
  },

  /** Deletes an Integration */
  updateInstallation: async (installationID: number) => {
    const dbInstallation = await Installation.findOne({ iID: installationID })
    if (!dbInstallation) {
      d.log(`Could not get a db reference for installation ${installationID} when updating`)
      return
    }

    if (!dbInstallation.perilSettingsJSONURL) {
      d.log(`Could not get installation ${installationID} did not have a perilSettingsJSONURL when updating`)
      return
    }

    const pathRep = dangerRepresentationForPath(dbInstallation.perilSettingsJSONURL)

    if (!pathRep.repoSlug || !pathRep.dangerfilePath) {
      d.log(`DangerfilePath for ${installationID} did not have a repoSlug/dangerfilePath when updating`)
      return
    }

    const file = await getGitHubFileContentsWithoutToken(pathRep.repoSlug, pathRep.dangerfilePath)
    if (file === "") {
      d.log(`Settings for ${installationID} at ${dbInstallation.perilSettingsJSONURL} were empty`)
      return
    }

    const parsedSettings = JSON5.parse(file) as Partial<GitHubInstallation>
    const installation = partialInstallationToInstallation(parsedSettings, dbInstallation.perilSettingsJSONURL)
    return await Installation.updateOne({ iID: installationID }, installation)
  },

  /** Deletes an Integration */
  deleteInstallation: async (installationID: number) => {
    const dbInstallation = await Installation.findOne({ iID: installationID })
    if (dbInstallation) {
      await dbInstallation.remove()
    }
  },
}

export type MongoDB = typeof database
export default database
