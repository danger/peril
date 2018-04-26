import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { dangerRepresentationForPath, dsl } from "../danger/danger_run"
import { runDangerForInstallation, ValidatedPayload } from "../danger/danger_runner"
import { DangerfileReferenceString, GitHubInstallation } from "../db/index"
import { getGitHubFileContents } from "../github/lib/github_helpers"
import winston from "../logger"

const error = (message: string) => {
  winston.info(`[github auth] - ${message}`)
  console.error(message) // tslint:disable-line
}

const runJob = async (installation: GitHubInstallation, rules: DangerfileReferenceString) => {
  const rep = dangerRepresentationForPath(rules)
  if (rep.repoSlug === undefined) {
    // If you don't provide a repo slug, assume that the
    // dangerfile comes from inside the same repo as your settings.
    rep.repoSlug = dangerRepresentationForPath(installation.perilSettingsJSONURL).repoSlug
  } else {
    error(`Error: could not determine a repo for ${rules} - skipping the task run`)
  }

  const payload: ValidatedPayload = {
    dsl: {} as any, // This can't have a git, or others
    webhook: {},
  }

  const token = await getTemporaryAccessTokenForInstallation(installation.iID)
  const dangerfile = await getGitHubFileContents(token, rep.repoSlug!, rep.dangerfilePath, rep.branch)
  return runDangerForInstallation(dangerfile, rep.dangerfilePath, null, dsl.import, installation, payload)
}

export default runJob
