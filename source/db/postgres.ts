import { getGitHubFileContents } from "../github/lib/github_helpers"
import { DATABASE_JSON_FILE, DATABASE_URL } from "../globals"
import winston from "../logger"
import { DatabaseAdaptor, GitHubInstallation, GithubRepo } from "./index"
import { GitHubUser } from "./types"

// Docs: https://github.com/vitaly-t/pg-promise
// Examples: https://github.com/vitaly-t/pg-promise/wiki/Learn-by-Example

import * as pg from "pg-promise"

let db: pg.IDatabase<{}>
/** Logs */
const info = (message: string) => {
  winston.info(`[db] - ${message}`)
}

const database: DatabaseAdaptor = {
  setup: async () => {
    db = pg()(DATABASE_URL)
  },

  /** Saves an Integration */
  saveInstallation: async (installation: GitHubInstallation) => {
    info(`Saving installation with id: ${installation.id}`)
    return db.one("insert into installations(id, settings, rules) values($1, $2, $3) returning *", [
      installation.id,
      JSON.stringify(installation.settings),
      JSON.stringify(installation.rules),
    ])
  },

  /** Saves a repo */
  saveGitHubRepo: async (repo: GithubRepo) => {
    info(`Saving repo with slug: ${repo.fullName}`)
    return db.one(
      "insert into github_repos(id, installations_id, full_name, rules) values($1, $2, $3, $4) returning *",
      [repo.id, repo.installationID, repo.fullName, JSON.stringify(repo.rules)]
    )
  },

  /** Gets an Integration */
  getInstallation: async (installationID: number): Promise<GitHubInstallation | null> => {
    return db.oneOrNone("select * from installations where id=$1", [installationID])
  },

  /** Deletes an Integration */
  deleteInstallation: (installationID: number) => {
    return db.one("select * from installations where id=$1", [installationID])
  },

  /** Gets a Github repo from the DB */
  getRepo: async (installationID: number, repoName: string): Promise<GithubRepo | null> => {
    const results = await db.any("select * from github_repos where installations_id=$1 and full_name=$2", [
      installationID,
      repoName,
    ])
    return results.length === 0 ? null : results[0]
  },

  /** Deletes a Github repo from the DB */
  deleteRepo: (installationID: number, repoName: string) => {
    info(`Deleting github repo ${repoName}`)
    return db.none("delete from github_repos where installations_id=$1 and full_name=$2", [installationID, repoName])
  },
}

export default database
