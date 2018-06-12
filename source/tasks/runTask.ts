import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { dangerRepresentationForPath, RunType } from "../danger/danger_run"
import { runDangerForInstallation, ValidatedPayload } from "../danger/danger_runner"
import { DangerfileReferenceString, GitHubInstallation } from "../db/index"
import { getGitHubFileContents } from "../github/lib/github_helpers"
import logger from "../logger"

export const runTask = async (
  taskName: string,
  installation: GitHubInstallation,
  rules: DangerfileReferenceString,
  data: any
) => {
  logger.info(`\n## task ${rules} on ${installation.login}`)

  const rep = dangerRepresentationForPath(rules)
  if (rep.repoSlug === undefined) {
    // If you don't provide a repo slug, assume that the
    // dangerfile comes from inside the same repo as your settings.
    rep.repoSlug = dangerRepresentationForPath(installation.perilSettingsJSONURL).repoSlug
  }

  const payload: ValidatedPayload = {
    dsl: {} as any, // This can't have a git,
    webhook: data,
  }
  const token = await getTemporaryAccessTokenForInstallation(installation.iID)
  const dangerfile = await getGitHubFileContents(token, rep.repoSlug!, rep.dangerfilePath, rep.branch)
  return runDangerForInstallation(
    taskName,
    [dangerfile],
    [rep.referenceString],
    null,
    RunType.import,
    installation,
    payload
  )
}
