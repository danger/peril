import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import vm2 from "danger/distribution/runner/runners/inline"

import { RunType } from "../../../danger/danger_run"
import { executorForInstallation } from "../../../danger/danger_runner"
import { getPerilPlatformForDSL } from "../../../danger/peril_platform"
import { GitHubInstallationSettings } from "../../../db/GitHubRepoSettings"
import { PERIL_BOT_USER_ID } from "../../../globals"
import { GitHubRunSettings } from "../github_runner"

/**
 * Supports commenting via Peril, this is only used on non-sandboxed runs
 */
export const commentOnResults = async (
  dslType: RunType,
  results: DangerResults,
  token: string,
  settings: GitHubRunSettings,
  installationSettings: GitHubInstallationSettings
) => {
  const githubAPI = githubAPIForCommentable(token, settings.repoName!, settings.commentableID)
  const gh = GitHub(githubAPI)
  const platform = getPerilPlatformForDSL(dslType, gh, {})
  const exec = executorForInstallation(platform, vm2, installationSettings)

  // TODO: Figure what happens here with `git` as being nully,
  // for one I think it would mean non-sandbox runs cant use inline?
  await exec.handleResults(results, {} as any)
}

/** Pulls out the main ID for commenting on a PR or Issue */
export const getIssueNumber = (json: any): number | null => {
  if (json.pull_request) {
    return json.pull_request.number
  }
  if (json.issue) {
    return json.issue.number
  }
  return null
}

/** Returns the in-house GithubAPI for a commentable */
export const githubAPIForCommentable = (token: string, repoSlug: string, issueNumber: number | null) => {
  const githubAPI = new GitHubAPI({ repoSlug, pullRequestID: String(issueNumber) }, token)
  githubAPI.additionalHeaders = {
    Accept: "application/vnd.github.machine-man-preview+json",
  }

  // How can I get this from an API, if we cannot use /me ?
  // https://api.github.com/repos/PerilTest/PerilPRTester/issues/5/comments
  // Talked to GH - they know it's an issue.
  githubAPI.getUserID = () => Promise.resolve(parseInt(PERIL_BOT_USER_ID as string, 10))
  return githubAPI
}
