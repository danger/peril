import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { octokitAPIForPeril } from "../../../danger/append_peril"
import { DangerRun, RunFeedback, RunType } from "../../../danger/danger_run"
import { runDangerForInstallation } from "../../../danger/danger_runner"
import { getGitHubFileContents } from "../../lib/github_helpers"
import { GitHubRunSettings } from "../github_runner"
import { githubAPIForCommentable } from "../utils/commenting"

export const runEventRun = async (
  eventName: string,
  runs: DangerRun[],
  settings: GitHubRunSettings,
  token: string,
  event: any
): Promise<DangerResults | null> => {
  if (!runs.length) {
    return null
  }

  const repoForDangerfile = runs[0].repoSlug || (event.repository && event.repository.full_name)
  if (!repoForDangerfile) {
    return null
  }
  // Can we actually provide feedback on this event?
  const supportsGithubCommentAPIs = runs[0].feedback === RunFeedback.commentable

  // Do we need an authenticated Danger GitHubAPI instance so we
  // can leave feedback on an issue?
  let githubAPI = null as GitHubAPI | null
  if (supportsGithubCommentAPIs && settings.commentableID && settings.repoName) {
    githubAPI = githubAPIForCommentable(token, settings.repoName, settings.commentableID)
  }

  const contents: string[] = []
  for (const run of runs) {
    const headDangerfile = await getGitHubFileContents(token, repoForDangerfile, run.dangerfilePath, run.branch)
    contents.push(headDangerfile)
  }

  const installationSettings = {
    iID: settings.installationID,
    settings: settings.installationSettings,
  }

  // Manually set the Octokit API object so that danger.github.api works
  const dangerDSL = {
    github: {
      ...event,
      api: await octokitAPIForPeril(settings.installationID, token),
    },
  }

  const results = await runDangerForInstallation(
    eventName,
    contents,
    runs.map(r => r.referenceString),
    githubAPI,
    RunType.import,
    installationSettings,
    { dsl: dangerDSL, webhook: event }
  )

  return results || null
}
