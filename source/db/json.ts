import * as JSON5 from "json5"
import { getGitHubFileContentsWithoutToken } from "../github/lib/github_helpers"
import { PERIL_ORG_INSTALLATION_ID } from "../globals"
import winston from "../logger"
import { DangerfileReferenceString, DatabaseAdaptor, GitHubInstallation, GithubRepo } from "./index"
import { GitHubUser } from "./types"

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
  /** Deletes an Integration */
  deleteInstallation: async (installationID: number) => {
    info(`Skipping saving github repo with slug.`)
  },

  /** Deletes a Github repo from the DB */
  deleteRepo: async (installationID: number, repoName: string) => {
    info(`Skipping deleting github repo ${repoName} due to no db`)
  },

  /** Gets an Integration */
  getInstallation: async (installationID: number): Promise<GitHubInstallation | null> => {
    return org
  },

  /** Gets a Github repo from the DB */
  getRepo: async (installationID: number, repoName: string): Promise<GithubRepo | null> => {
    const repos = org.repos
    if (!repos[repoName]) {
      return null
    }

    const repo: GithubRepo = {
      fullName: repoName,
      id: 111, // Should I care?
      installationID: 1, // Should I care?
      rules: repos[repoName],
    }
    return repo
  },

  /** Saves a repo */
  saveGitHubRepo: async (repo: GithubRepo) => {
    info(`Skipping saving github repo with slug: ${repo.fullName} due to no db`)
  },

  /** Saves an Integration */
  saveInstallation: async (installation: GitHubInstallation) => {
    info(`Skipping saving installation due to no db: ${installation.id}`)
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

      org = {
        id: PERIL_ORG_INSTALLATION_ID,
        repos: parsedOrg.repos || {},
        rules: parsedOrg.rules || {},
        scheduler: parsedOrg.scheduler || {},
        tasks: parsedOrg.tasks || {},
        settings: {
          env_vars: (parsedOrg.settings && parsedOrg.settings.env_vars) || [],
          ignored_repos: (parsedOrg.settings && parsedOrg.settings.ignored_repos) || [],
          modules: (parsedOrg.settings && parsedOrg.settings.modules) || [],
        },
      }
    }
  },
})

export default jsonDatabase

const throwNoJSONFileFound = (dangerFilePath: DangerfileReferenceString) => {
  /* tslint:disable: max-line-length */
  const msg = "Could not find find a JSON file for Peril settings."
  const subtitle = `It's likely that Peril cannot connect to ${dangerFilePath}, check the logs for more info above here.`
  const action = `You'll probably need to make changes to your  "DATABASE_JSON_FILE" in your ENV vars.`
  throw new Error([msg, subtitle, action].join(" "))
  /* tslint:enable: max-line-length */
}
