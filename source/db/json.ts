import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { getGitHubFileContents } from "../github/lib/github_helpers"
import { PERIL_ORG_INSTALLATION_ID } from "../globals"
import winston from "../logger"
import { DangerfileReferenceString, DatabaseAdaptor, GitHubInstallation, GithubRepo } from "./index"
import { GitHubUser } from "./types"

// Effectively you need to have a JSON file that looks like a GitHubInstallation,
// but also have a `repos` array of GitHUbRepo -so you can do per repo rules in there.

/*
For example:
{
  "settings": {
    "onlyForOrgMembers": false
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
const info = (message: string) => {
  winston.info(`[db] - ${message}`)
}

const installationById = (installationId: string | undefined): GitHubInstallation => {
  return {
    id: getInstallationId(installationId),
    rules: {},
    settings: {},
  }
}

const getInstallationId = (id: string | undefined): number => {
  let installationId: number | undefined = parseInt(id as string, 10)
  if (Number.isNaN(installationId)) {
    installationId = undefined
  }
  return installationId as number
}

let org: GitHubInstallation = null as any

const jsonDatabase = (dangerFilePath: DangerfileReferenceString): DatabaseAdaptor => ({
  setup: async () => {
    const repo = dangerFilePath.split("@")[0]
    const path = dangerFilePath.split("@")[1]
    // Try see if we can pull it without an access token
    let file = await getGitHubFileContents(null, repo, path, null)
    // Might be private, in this case you have to have set up PERIL_ORG_INSTALLATION_ID
    if (file === "") {
      if (!PERIL_ORG_INSTALLATION_ID) {
        throwNoPerilInstallationID()
      }
      const token = await getTemporaryAccessTokenForInstallation(installationById(PERIL_ORG_INSTALLATION_ID))
      file = await getGitHubFileContents(token, repo, path, null)
    }

    if (file === "") {
      throwNoJSONFileFound(dangerFilePath)
    }
    org = JSON.parse(file)
    org.id = getInstallationId(PERIL_ORG_INSTALLATION_ID)
  },

  /** Saves an Integration */
  saveInstallation: async (installation: GitHubInstallation) => {
    info(`Skipping saving installation due to no db: ${installation.id}`)
  },

  /** Saves a repo */
  saveGitHubRepo: async (repo: GithubRepo) => {
    info(`Skipping saving github repo with slug: ${repo.fullName} due to no db`)
  },

  /** Gets an Integration */
  getInstallation: async (installationID: number): Promise<GitHubInstallation | null> => {
    return org
  },

  /** Deletes an Integration */
  deleteInstallation: async (installationID: number) => {
    info(`Skipping saving github repo with slug.`)
  },

  /** Gets a Github repo from the DB */
  getRepo: async (installationID: number, repoName: string): Promise<GithubRepo | null> => {
    // Type this?
    const repos = (org as any).repos
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

  /** Deletes a Github repo from the DB */
  deleteRepo: async (installationID: number, repoName: string) => {
    info(`Skipping deleting github repo ${repoName} due to no db`)
  },
})

export default jsonDatabase

// Some error handling.

const throwNoPerilInstallationID = () => {
  /* tslint:disable: max-line-length */
  const msg =
    "Sorry, if you have a Peril JSON setttings file in a private repo, you will need an installation ID for your integration."
  const subtitle =
    "You can find this inside the integration_installation event sent when you installed the integration into your org."
  const action = `Set this as "PERIL_ORG_INSTALLATION_ID" in your ENV vars.`
  throw new Error([msg, subtitle, action].join(" "))
  /* tslint:enable: max-line-length */
}

const throwNoJSONFileFound = (dangerFilePath: DangerfileReferenceString) => {
  /* tslint:disable: max-line-length */
  const msg = "Could not find find a JSON file for Peril settings."
  const subtitle = `It's likely that Peril cannot connect to ${dangerFilePath}, check the logs for more info above here.`
  const action = `You'll probably need to make changes to your  "DATABASE_JSON_FILE" in your ENV vars.`
  throw new Error([msg, subtitle, action].join(" "))
  /* tslint:enable: max-line-length */
}
