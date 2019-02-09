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

/** An individual integration of Danger via Peril, this is like the org */
export interface GitHubInstallation extends PerilInstallationSettings {
  // Not these settings are things added by Peril, and it's not expected
  // that they are in the settings.json nor available to JSON-based hosts

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
   * Scheduled tasks to run using a human readable syntax. This runs from a set of standard hooks
   * which will trigger running a task. The current hooks (may be out of date, see `InstallationSchedulerKeys` in
   * the codebase) are "hourly", "daily", "weekly", "monday-morning-est", "tuesday-morning-est",
   * "wednesday-morning-est", "thursday-morning-est", "friday-morning-est"
   *
   *     "scheduler" : {
   *       "daily": "daily-license-check",
   *       "weekly": "cleanup-stale-issues"
   *     }
   */
  scheduler: TaskObject

  /**
   * Individual tasks which a Peril can schedule, either via the Dangerfile API or via the
   * scheduler object. These keys are used by the scheduler in the settings JSON, and can be used
   * to trigger a job to occur in the future via `peril.scheduleTask` in a Dangerfile.
   *
   *   "tasks" : {
   *     "message-slack-dev-channel": "tasks/slackDevChannel.ts",
   *     "daily-license-check": "tasks/dailyLicenseCheck.ts",
   *     "standup": ["tasks/checkForOpenRFCs.ts", "tasks/checkForNewRepos.ts"],
   *   }
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

  /**
   * Slack URL that Peril can send system messages to
   */
  installationSlackUpdateWebhookURL: string | undefined
}

export interface UniqueRepoRuleset {
  [name: string]: RunnerRuleset
}

/** The available keys for scheduling a task against */
export type InstallationSchedulerKeys =
  | "hourly"
  | "daily"
  | "weekly"
  | "monday-morning-est"
  | "tuesday-morning-est"
  | "wednesday-morning-est"
  | "thursday-morning-est"
  | "friday-morning-est"

type TaskObject = { [P in InstallationSchedulerKeys]?: string }

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
  /** Gets an integrations settings */
  getSchedulableInstallationsWithKey: (key: string) => Promise<GitHubInstallation[]>
}
