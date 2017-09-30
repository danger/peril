import winston from "../logger"
import { GitHubUser } from "./types"

import { GitHubInstallationSettings } from "./GitHubRepoSettings"
import jsonDB from "./json"
import postgres from "./postgres"

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
  settings: GitHubInstallationSettings

  /** Having rules in here would mean that it would happen on _any_ event, another JSON type in the DB */
  rules: RunnerRuleset
}

export interface RunnerRuleset {
  [name: string]: DangerfileReferenceString
}

export interface GithubRepo {
  /** UUID */
  id: number
  /** The installation that this repo is connected to */
  installationID: number
  /** The full name of the slug for this repo, note these could not be unique (GitHub Enterprise?) */
  fullName: string
  /** Runner rules ID reference, another JSON type in the DB */
  rules: RunnerRuleset
}

export interface DatabaseAdaptor {
  /** A once per server start setup function */
  setup: () => Promise<void>

  /** Gets an integrations settings */
  getInstallation: (installationID: number) => Promise<GitHubInstallation | null>
  /** Saves an Integration */
  saveInstallation: (installation: GitHubInstallation) => Promise<void>
  /** Deletes the operation */
  deleteInstallation: (installationID: number) => Promise<void>

  /** Gets an optional repo out of the installation settings */
  getRepo: (installationID: number, repoName: string) => Promise<GithubRepo | null>
  /** Saves a Repo */
  saveGitHubRepo: (repo: GithubRepo) => Promise<void>
  /** Deletes a repo from the  */
  deleteRepo: (installationID: number, repoName: string) => Promise<void>
}
