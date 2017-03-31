import * as express from "express"

import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"

import { dangerRunForRules, DangerRun, dsl, feedback } from "../../danger/actions"

import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import { runDangerAgainstInstallation } from "../../danger/danger_runner"
import { getInstallation, GitHubInstallation, getRepo, GithubRepo } from "../../db"
import { isUserInOrg } from "../lib/github_helpers"

export async function githubDangerRunner(event: string, req: express.Request, res: express.Response) {
  const action = req.body.action as string | null
  const installationID = req.body.installation.id as number

  let installation = await getInstallation(installationID)
  if (!installation) {
    res.status(404).send(`Could not find installation with id: ${installationID}`)
    return
  }

  // This could definitely be null, for example: Org User Added
  // Bit of awkward type jugging here...
  const fullRepoName = req.body.repository.full_name as string | null
  let repo = null as GithubRepo | null
  if (fullRepoName) { repo = await getRepo(installationID, fullRepoName) }

  const installationRun = dangerRunForRules(event, action, installation.rules)
  const repoRun = dangerRunForRules(event, action, repo && repo.rules)
  const runs = [installationRun, repoRun].filter(r => !!r) as DangerRun[]

  if (runs.length === 0) {
    res.status(302).send(`No work to do.`)
    return
  }

  const token = await getTemporaryAccessTokenForInstallation(installation)

  for (const run of runs) {
    const supportGithubCommentAPIs = run.feedback === feedback.commentable
    // Do we need an authenticated Danger GitHubAPI instance so we
    // can leave feedback on an issue?
    let githubAPI = null as GitHubAPI | null
    if (supportGithubCommentAPIs && repo) {
      const issue = getIssueNumber(req.body)
      githubAPI = githubAPIForCommentable(run, token, repo, issue)
    }

    const triggeredByUser = req.body.sender as any | null
    if (triggeredByUser && githubAPI && repo && installation && installation.settings.onlyForOrgMembers) {
      const org = repo.fullName.split("/")[0]
      const userInOrg = await isUserInOrg(triggeredByUser, org, githubAPI)
      if (!userInOrg) {
        res.status(302).send(`Not running because ${triggeredByUser} is not in ${org}.`)
        return
      }
    }

    const dangerfile = run.dangerfilePath
    runDangerAgainstInstallation(dangerfile, pr, githubAPI)
  }
}

/**
 * Executes Danger based on a DangerRun instance
 * 
 * @param run The DangeRun to work with
 * @param token API token

 */

const runDangerRun = async (run: DangerRun, githubAPI?: GitHubAPI) => {
  const supportGithubCommentAPIs = run.feedback === feedback.commentable
  const useFullDangerDSL = run.dslType === dsl.pr

}

// This doens't feel great, but is OK for now
const getIssueNumber = (json: any): number | null => {
  if (json.pull_request) { return json.pull_request.number }
  if (json.issue) { return json.issue.number }
  return null
}

const githubAPIForCommentable = (run: DangerRun, token: string, repo: GithubRepo | null, issueNumber: number | null) => {
  const thisRepo = run.repoSlug || repo && repo.fullName
  // Any commentable event will include a repo
  const forceRepo = thisRepo as string

  const githubAPI = new GitHubAPI({ repoSlug: forceRepo, pullRequestID: String(issueNumber) }, token)
  githubAPI.additionalHeaders = { Accept: "application/vnd.github.machine-man-preview+json" }

  // How can I get this from an API, if we cannot use /me ?
  // https://api.github.com/repos/PerilTest/PerilPRTester/issues/5/comments
  githubAPI.getUserID = () => Promise.resolve(24758014)
  return githubAPI
}

export default githubDangerRunner
