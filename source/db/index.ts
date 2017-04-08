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

  /** Having rules in here would mean that it would happen on _any_ event, another JSON type in the DB */
  rules: RunnerRuleset
}

/** Saves an Integration */
export async function saveInstallation(installation: GitHubInstallation) {
  winston.log("db", `Saving installation with id: ${installation.id}`)
  return db.one(
    "insert into installations(id, settings, rules) values($1, $2, $3) returning *",
    [installation.id, JSON.stringify(installation.settings), JSON.stringify(installation.rules)])
}

export type RunnerRuleset = { [name: string]: DangerfileReferenceString }

export interface GithubRepo {
  /** UUID */
  id: number
  /** The installation that this repo is connected to */
  installationID: number,
  /** The full name of the slug for this repo, note these could not be unique (GitHub Enterprise?) */
  fullName: string,
  /** Runner rules ID reference, another JSON type in the DB */
  rules: RunnerRuleset
}

/** Saves a repo */
export async function saveGitHubRepo(repo: GithubRepo) {
  winston.log("db", `Saving repo with slug: ${repo.fullName}`)
  return db.one(
    "insert into github_repos(id, installations_id, full_name, rules) values($1, $2, $3, $4) returning *",
    [repo.id, repo.installationID, repo.fullName, JSON.stringify(repo.rules)])
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/** Gets an Integration */
export async function getInstallation(installationID: number): Promise<GitHubInstallation | null> {
  return db.one("select * from installations where id=$1", [installationID])
}

/** Deletes an Integration */
export async function deleteInstallation(installationID: number): Promise<GitHubInstallation> {
  return db.one("select * from installations where id=$1", [installationID])
}

/** Gets a Github repo from the DB */
export async function getRepo(installationID: number, repoName: string): Promise<GithubRepo | null> {
  try {
    return db.one("select * from github_repos where installations_id=$1 and full_name=$2", [installationID, repoName])

  } catch (error) {
    // Allow nullable repo calls
    if (error.name === "QueryResultError") {
      return null
    } else {
      throw error
    }
  }
}
/** Deletes a Github repo from the DB */
export async function deleteRepo(installationID: number, repoName: string): Promise<GithubRepo> {
  return db.one("delete from github_repos where installations_id=$1 and full_name=$2", [installationID, repoName])
}
