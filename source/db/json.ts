import { getGitHubFileContents } from "../github/lib/github_helpers"
import { DATABASE_JSON_FILE, DATABASE_URL } from "../globals"
import winston from "../logger"
import { DatabaseAdaptor, GitHubInstallation, GithubRepo } from "./index"
import { GitHubUser } from "./types"

// Effectively you need to have a JSON file that looks like a GitHubInstallation,
// but also have a `repos` array of GitHUbRepo -so you cna do per repo rules in there.

/** Logs */
const info = (message: string) => { winston.info(`[db] - ${message}`) }

let org: GitHubInstallation = null as any

const database: DatabaseAdaptor = {

  setup: async () => {
      const repo = DATABASE_JSON_FILE.split("@")[0]
      const path = DATABASE_JSON_FILE.split("@")[1]
      const file = await getGitHubFileContents("", repo, path, null)
      org = JSON.parse(file)
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
    const repos: GithubRepo[] = (org as any).repos
    return repos.find((r) => r.fullName === repoName) || null
  },

  /** Deletes a Github repo from the DB */
  deleteRepo: async (installationID: number, repoName: string) => {
    info(`Skipping deleting github repo ${repoName} due to no db`)
  },
}

export default database
