import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { dangerRepresentationForPath, dsl } from "../danger/danger_run"
import { runDangerForInstallation } from "../danger/danger_runner"
import { DangerfileReferenceString, GitHubInstallation } from "../db/index"
import { getGitHubFileContents } from "../github/lib/github_helpers"
import { DATABASE_JSON_FILE } from "../globals"
import winston from "../logger"

const error = (message: string) => {
  winston.info(`[github auth] - ${message}`)
  console.error(message) // tslint:disable-line
}

export const runTask = async (installation: GitHubInstallation, rules: DangerfileReferenceString, data: any) => {
  // This is duped with runJob
  const rep = dangerRepresentationForPath(rules)
  if (rep.repoSlug === undefined) {
    if (DATABASE_JSON_FILE) {
      // If you don't provide a repo slug, assume that the
      // dangerfile comes from inside the same repo as your settings.
      rep.repoSlug = DATABASE_JSON_FILE.split("@")[0]
    } else {
      error(`Error: could not determine a repo for ${rules} - skipping the task run`)
    }
  }

  // Expand the Peril DSL with data from the task
  const dangerDSL = {
    peril: {
      data,
    },
  }
  const token = await getTemporaryAccessTokenForInstallation(installation.iID)
  const dangerfile = await getGitHubFileContents(token, rep.repoSlug!, rep.dangerfilePath, rep.branch)
  return runDangerForInstallation(dangerfile, rep.dangerfilePath, null, dsl.import, installation, dangerDSL)
}
