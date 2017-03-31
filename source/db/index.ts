import * as winston from "winston"
import { DATABASE_URL } from "../globals"
import { GitHubUser } from "./types"

// Docs: https://github.com/vitaly-t/pg-promise
// Examples: https://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example

import * as pg from "pg-promise"
let db = pg()(DATABASE_URL)

/**
 * Should look like one of the following:
 * - "dangerfile.js"
 * - "/path/to/dangerfile.ts"
 * - "repo/slug@to/dangerfile.ts"
 */
export type DangerfileReferenceString = string

/**
 * An event string would be something like:
 * - "pull_request.*"
 * - "pull_request.updated"
 * - "ping"
 * - "issue.*"
 */
export type PerilEventString = string

/** An individual integration of Danger via Peril, this is like the org */
export interface GitHubInstallation {
  /**
   * The ID Integration, this is used when talking to GitHub mainly, but is used
   * as a unique ID in our db
   */
  id: number
  /**
   * In our DB this is represented as a JSON type, so you should always have settings
   * as a nullable type. These are the entire installation settings.
   */
  settings: {
    /** Should only org members run Danger? */
    onlyForOrgMembers?: boolean,
  }

  /** Having rules in here would mean that it would happen on _any_ event */
  runnerRules: RunnerRules
}

export type RunnerRuleset = { [name: string]: DangerfileReferenceString }

/** Represents the settings for any Danger run */
export interface RunnerRules {
    /** Normal incremental ID */
    id: number
    /** A dictionary of events to which are `PerilEventString`: DangerfileReferenceString */
    rules: RunnerRuleset
}

export interface GithubRepo {
  /** The installation that this repo is connected to */
  installationID: number,
  /** The ful name of the slug for this repo, note these could not be unique (GitHub Enterprise?) */
  fullName: string,
  /** Runner rules ID reference */
  runnerRulesID: number
}

/** Gets an Integration */
export async function getInstallation(installationID: number): Promise<GitHubInstallation> {
  winston.log("db", `Getting installation with id: ${installationID}`)
  return db.one("select * from installations where id=$1", [installationID])
}

/** Saves an Integration */
export async function saveInstallation(installation: GitHubInstallation) {
  winston.log("db", `Saving installation with id: ${installation.id}`)
  return db.one("insert into installations(id, settings) values($1, $2) returning *",
    [installation.id, JSON.stringify(installation.settings)])
}

/** Updates the db */
export async function updateInstallation(installation: GitHubInstallation) {
  winston.log("db", `Updating installation with id: ${installation.id}`)
  winston.log("db", `Does not do anything`)
  // return db.collection("installations").update({ id: installation.id }, { $set: installation })
}
