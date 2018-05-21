import { GitHubInstallationSettings } from "./GitHubRepoSettings"

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

// TODO: Figure out how to separate things users put in settings, and stuff we need inside peril

/** An individual integration of Danger via Peril, this is like the org */
export interface GitHubInstallation extends PerilInstallationSettings {
  /** The associated name of the installation owner */
  login: string
  /** An image url for the installation owner */
  avatarURL: string
  /** An image url for the installation owner */
  envVars?: any
}

export interface PerilSettingsRepoJSON {
  /**
   * In our DB this is represented as a JSON type, so you should anticipate have settings
   * as a nullable type. These are the entire installation settings.
   */
  settings: GitHubInstallationSettings

  /** Having rules in here would mean that it would happen on _any_ event, another JSON type in the DB */
  rules: RunnerRuleset

  /**
   * Scheduled tasks to run using a cron-like syntax.
   *
   * This uses [node-schedule](https://github.com/node-schedule/node-schedule) under the hood. The
   * object is similar to the rules section, in that you define a cron-string with the following format:
   *
   *    *    *    *    *    *    *
   *    ┬    ┬    ┬    ┬    ┬    ┬
   *    │    │    │    │    │    |
   *    │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
   *    │    │    │    │    └───── month (1 - 12)
   *    │    │    │    └────────── day of month (1 - 31)
   *    │    │    └─────────────── hour (0 - 23)
   *    │    └──────────────────── minute (0 - 59)
   *    └───────────────────────── second (0 - 59, OPTIONAL)
   *
   * Which would look something like:
   *
   *    "scheduler": {
   *      "0 0 12 * * ?": "schedule/daily_at_twelve.ts",
   *      "0 9 * * 1-5": "schedule/weekday_wakeup_email.ts"
   *    }
   *
   * in practice. There's a lot of great resources on the net showing the general syntax.
   */
  scheduler: RunnerRuleset

  /**
   * Individual tasks which a Dangerfile can schedule against
   */
  tasks: RunnerRuleset

  /**
   * A set of repos and their additional event hooks, these are
   * in addition to the ones provided by `"rules"` which are applied
   * to every repo.
   *
   *     "repos" : {
   *       "orta/ORStackView": {
   *          "issue.created": "orta/peril@lock_issues.ts"
   *       }
   *     }
   *
   */
  repos: UniqueRepoRuleset
}

/** An individual integration of Danger via Peril, this is like the org */
export interface PerilInstallationSettings extends PerilSettingsRepoJSON {
  /**
   * The ID Integration, this is used when talking to GitHub mainly, but is used
   * as a unique ID in our db
   */
  iID: number

  /**
   * The path to the settings repo and json file
   * e.g. danger/peril-settings@settings.json
   *
   * Filled in automatically when using JSON db, and
   * is the initial string when working in the public mode
   */
  perilSettingsJSONURL: DangerfileReferenceString
}

export interface UniqueRepoRuleset {
  [name: string]: RunnerRuleset
}

export interface RunnerRuleset {
  [name: string]: DangerfileReferenceString | DangerfileReferenceString[]
}

export interface GithubRepo {
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
  /** Updates an integrations settings */
  updateInstallation: (installationID: number) => Promise<GitHubInstallation | null>
  /** Saves an Integration */
  saveInstallation: (installation: GitHubInstallation) => Promise<GitHubInstallation>
  /** Deletes the operation */
  deleteInstallation: (installationID: number) => Promise<void>
}
