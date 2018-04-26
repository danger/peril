import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { DangerRun, RunFeedback } from "../../../danger/danger_run"
import { runDangerForInstallation } from "../../../danger/danger_runner"
import { getGitHubFileContents } from "../../lib/github_helpers"
import { GitHubRunSettings } from "../github_runner"
import { githubAPIForCommentable } from "../utils/commenting"

export const runEventRun = async (
  run: DangerRun,
  settings: GitHubRunSettings,
  token: string,
  dangerDSL: any
): Promise<DangerResults | null> => {
  const repoForDangerfile = run.repoSlug || (dangerDSL.repository && dangerDSL.repository.full_name)
  if (!repoForDangerfile) {
    return null
  }
  // Can we actually provide feedback on this event?
  const supportsGithubCommentAPIs = run.feedback === RunFeedback.commentable

  // Do we need an authenticated Danger GitHubAPI instance so we
  // can leave feedback on an issue?
  let githubAPI = null as GitHubAPI | null
  if (supportsGithubCommentAPIs && settings.commentableID && settings.repoName) {
    githubAPI = githubAPIForCommentable(token, settings.repoName, settings.commentableID)
  }

  const headDangerfile = await getGitHubFileContents(token, repoForDangerfile, run.dangerfilePath, run.branch)

  const installationSettings = {
    iID: settings.installationID,
    settings: settings.installationSettings,
  }

  const results = await runDangerForInstallation(
    headDangerfile,
    run.referenceString,
    githubAPI,
    run.dslType,
    installationSettings,
    { dsl: {}, webhook: dangerDSL }
  )

  return results || null
}
