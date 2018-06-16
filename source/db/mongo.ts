import * as debug from "debug"
import * as JSON5 from "json5"

import { connect, Document, model, Schema } from "mongoose"

import _ = require("lodash")
import { dangerRepresentationForPath } from "../danger/danger_run"
import { getGitHubFileContentsWithoutToken } from "../github/lib/github_helpers"
import { MONGODB_URI } from "../globals"
import { GitHubInstallation } from "./index"

const d = debug("peril:mongo")

/**
 * Basically the same thing as a PerilInstallationSettings but coming from the database
 * which might mean that we add extra db-specific metadata
 */
export interface MongoGithubInstallationModel extends Document, GitHubInstallation {
  /** If this is set to be in the future, any webhook for this installation will get saved in the db */
  recordWebhooksUntilTime: Date
}

/** The model for an installation in the DB */
const Installation = model<MongoGithubInstallationModel>(
  "GithubInstallation",
  new Schema({
    // Comes from the JSON config
    repos: Schema.Types.Mixed,
    rules: Schema.Types.Mixed,
    settings: Schema.Types.Mixed,
    tasks: Schema.Types.Mixed,
    scheduler: Schema.Types.Mixed,

    // Needed by Peril
    iID: Number,
    login: String,
    perilSettingsJSONURL: String,
    recordWebhooksUntilTime: Date,
    envVars: Schema.Types.Mixed,
  })
)

/* 
 * Basically, Mongo does not allow you to have a key with a '.' in it. This
 * isn't great for us, because 'x.y' is real common, so, we amend the keys in
 * the JSON on load/save to ensure it can be saved.
 */
const userInput = ["repos", "rules", "settings", "tasks", "scheduler"]

export const prepareToSave = (installation: Partial<GitHubInstallation>) => {
  const amendedInstallation: any = installation
  userInput.forEach(i => {
    if (amendedInstallation[i]) {
      amendedInstallation[i] = removeDots(amendedInstallation[i])
    }
  })
  return installation
}

export const convertDBRepresentationToModel = (installation: GitHubInstallation) => {
  const amendedInstallation: any = installation
  userInput.forEach(i => {
    if (amendedInstallation[i]) {
      amendedInstallation[i] = bringBackDots(amendedInstallation[i])
    } else {
      // Handles the potential nullability of the userInputs above
      amendedInstallation[i] = {}
    }
  })
  return installation
}

// We can't store keys which have a dot/dollar in them, and basically all settings JSON has dots.
// See https://docs.mongodb.com/manual/reference/limits/#Restrictions-on-Field-Names
const removeDots = (obj: object) => transformKeys(obj, ".", "___", "$", "^^^")
const bringBackDots = (obj: object) => transformKeys(obj, "___", ".", "^^^", "$")

const transformKeys = (obj: any, before1: string, after1: string, before2: string, after2: string) =>
  Object.keys(obj).reduce(
    (o, prop) => {
      const value = obj[prop]
      const newProp = prop.replace(before1, after1).replace(before2, after2)
      o[newProp] = value
      return o
    },
    {} as any
  )

export const mongoDatabase = {
  setup: async () => {
    await connect(MONGODB_URI)
  },

  /** Saves an Integration */
  saveInstallation: async (installation: Partial<MongoGithubInstallationModel>) => {
    d(`Saving installation with id: ${installation.iID}`)

    const sanitizedInstallation = prepareToSave(installation)
    const dbInstallation = await Installation.findOne({ iID: installation.iID })

    const newInstallation = // Update it, or make it
      (dbInstallation && Object.assign(dbInstallation, sanitizedInstallation)) ||
      new Installation(sanitizedInstallation)

    await newInstallation.save()
    return newInstallation
  },

  /** Gets an installation */
  getInstallation: async (installationID: number): Promise<GitHubInstallation | null> => {
    const dbInstallation = await Installation.findOne({ iID: installationID })
    return (dbInstallation && convertDBRepresentationToModel(dbInstallation)) || null
  },

  /** Gets an installation via it's ID in the db, used in Relay */
  getInstallationByDBID: async (id: string): Promise<GitHubInstallation | null> => {
    const dbInstallation = await Installation.findById(id)
    return (dbInstallation && convertDBRepresentationToModel(dbInstallation)) || null
  },

  /** Gets a set of Integrations */
  getInstallations: async (installationID: number[]): Promise<GitHubInstallation[]> => {
    const dbInstallations = await Installation.where("iID").in(installationID)
    return dbInstallations.map(convertDBRepresentationToModel)
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

    // Only allow the JSON to overwrite user editable settings in mongo
    const json = JSON5.parse(file)
    const parsedSettings: Partial<GitHubInstallation> = _.pick(json, userInput)

    const sanitizedSettings = prepareToSave(parsedSettings)
    return await Installation.updateOne({ iID: installationID }, sanitizedSettings)
  },

  /** Deletes an Integration */
  deleteInstallation: async (installationID: number) => {
    const dbInstallation = await Installation.findOne({ iID: installationID })
    if (dbInstallation) {
      await dbInstallation.remove()
    }
  },
}

export type MongoDB = typeof mongoDatabase
