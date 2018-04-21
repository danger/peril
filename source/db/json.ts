import * as JSON5 from "json5"

import { getGitHubFileContentsWithoutToken } from "../github/lib/github_helpers"
import { PERIL_ORG_INSTALLATION_ID } from "../globals"
import winston from "../logger"
import { getDB } from "./getDB"
import { DangerfileReferenceString, DatabaseAdaptor, GitHubInstallation } from "./index"

// Effectively you need to have a JSON file that looks like a GitHubInstallation,
// but also have a `repos` array of GitHubRepo -so you can do per repo rules in there.

/*
For example:
{
  "settings": {
  },
  "rules": {
   "pull_request": "orta/peril@pr.ts",
   "issue": "orta/peril@issue.ts"
  },
  "repos" : {
    "orta/ORStackView": {
      "issue.created": "orta/peril@lock_issues.ts"
    }
  }
}
*/

/** Logs */
const info = (message: string) => winston.info(`[json db] - ${message}`)
const error = (message: string) => winston.error(`[json db] - ${message}`)

let org: GitHubInstallation = null as any

const jsonDatabase = (dangerFilePath: DangerfileReferenceString): DatabaseAdaptor => ({
  /** Gets an Integration */
  getInstallation: async (_: number): Promise<GitHubInstallation | null> => {
    return org
  },

  /** Deletes an Integration */
  deleteInstallation: async (_: number) => {
    info(`Skipping saving github repo with slug.`)
  },

  /** Saves an Integration */
  saveInstallation: async (installation: GitHubInstallation) => {
    info(`Skipping saving installation due to no db: ${installation.iID}`)
  },

  /** Updates the JSON for the db */
  updateInstallation: async (_: number) => {
    const db = await getDB()
    await db.setup()
    return org
  },

  setup: async () => {
    const repo = dangerFilePath.split("@")[0]
    const path = dangerFilePath.split("@")[1]

    const file = await getGitHubFileContentsWithoutToken(repo, path)

    if (file === "") {
      throwNoJSONFileFound(dangerFilePath)
    }

    const parsedOrg = JSON5.parse(file) as Partial<GitHubInstallation>
    if (!parsedOrg) {
      error(`Could not run JSON.parse on the contents of ${dangerFilePath}.`)
      process.exitCode = 1
    } else {
      // Set our write-once org variable that is then re-used for all of the different
      // installation related calls
      org = partialInstallationToInstallation(parsedOrg, dangerFilePath)
    }
  },
})

/**
 * Go from a potentially semi-filled in Installation, to one
 * where you can trust that things exist.
 */
export const partialInstallationToInstallation = (
  partial: Partial<GitHubInstallation>,
  dangerfileRefString: DangerfileReferenceString
) => ({
  iID: partial.iID || PERIL_ORG_INSTALLATION_ID,
  repos: partial.repos || {},
  rules: partial.rules || {},
  scheduler: partial.scheduler || {},
  tasks: partial.tasks || {},
  perilSettingsJSONURL: dangerfileRefString,
  settings: {
    env_vars: (partial.settings && partial.settings.env_vars) || [],
    ignored_repos: (partial.settings && partial.settings.ignored_repos) || [],
    modules: (partial.settings && partial.settings.modules) || [],
  },
})

export default jsonDatabase

const throwNoJSONFileFound = (dangerFilePath: DangerfileReferenceString) => {
  const msg = "Could not find find a JSON file for Peril settings."
  const subtitle = `It's likely that Peril cannot connect to ${dangerFilePath}, check the logs for more info above here.`
  const action = `You'll probably need to make changes to the "DATABASE_JSON_FILE" in your ENV vars.`
  throw new Error([msg, subtitle, action].join(" "))
}
