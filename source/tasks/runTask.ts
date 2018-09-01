import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { dangerRepresentationForPath, RunType } from "../danger/danger_run"
import { runDangerForInstallation, ValidatedPayload } from "../danger/danger_runner"
import { DangerfileReferenceString, GitHubInstallation } from "../db/index"
import { getGitHubFileContents } from "../github/lib/github_helpers"
import logger from "../logger"

export const runTask = async (
  taskName: string,
  installation: GitHubInstallation,
  references: DangerfileReferenceString[],
  data: any
) => {
  // Get representations that are also prefixed by the global settings JSON repo if needed
  const prefixedReps = references.map(dangerfileRef => {
    const rep = dangerRepresentationForPath(dangerfileRef)
    if (!rep.repoSlug) {
      // If you don't provide a repo slug, assume that the
      // dangerfile comes from inside the same repo as your settings.
      rep.repoSlug = dangerRepresentationForPath(installation.perilSettingsJSONURL).repoSlug
      rep.referenceString = `${rep.repoSlug}@${rep.dangerfilePath}`
    }
    return rep
  })

  logger.info(`\n## task ${references} on ${installation.login}.`)

  const payload: ValidatedPayload = {
    dsl: {} as any, // This can't have a DSL for git, etc
    webhook: data,
  }

  const token = await getTemporaryAccessTokenForInstallation(installation.iID)

  // Get all the dangerfiles, this is needed for inline (JSON-based) runs
  const dangerfiles = []
  for (const rep of prefixedReps) {
    const dangerfile = await getGitHubFileContents(token, rep.repoSlug!, rep.dangerfilePath, rep.branch)
    dangerfiles.push(dangerfile)
  }

  return runDangerForInstallation(
    taskName,
    dangerfiles,
    prefixedReps.map(r => r.referenceString),
    null,
    RunType.import,
    installation,
    payload
  )
}
