import * as express from "express"

import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"

import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import { DangerRun, dangerRunForRules, dsl, feedback } from "../../danger/danger_run"
import { executorForInstallation, runDangerAgainstInstallation } from "../../danger/danger_runner"
import { getInstallation, getRepo, GitHubInstallation, GithubRepo } from "../../db"
import { getGitHubFileContents, isUserInOrg } from "../lib/github_helpers"

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
  const runs = [installationRun, repoRun].filter((r) => !!r) as DangerRun[]

  if (runs.length === 0) {
    res.status(204).send(`No work to do.`)
    return
  }

  const token = await getTemporaryAccessTokenForInstallation(installation)

  const allResults = [] as DangerResults[]
  for (const run of runs) {
    const useFullDangerDSL = run.dslType === dsl.pr
    const supportGithubCommentAPIs = run.feedback === feedback.commentable

    // Do we need an authenticated Danger GitHubAPI instance so we
    // can leave feedback on an issue?
    let githubAPI = null as GitHubAPI | null
    if (supportGithubCommentAPIs && repo) {
      const issue = getIssueNumber(req.body)
      githubAPI = githubAPIForCommentable(run, token, repo, issue)
    }

    // Are we being extra paranoid about running Dangerfiles?
    const triggeredByUser = req.body.sender as any | null
    if (triggeredByUser && githubAPI && repo && installation && installation.settings.onlyForOrgMembers) {
      const org = repo.fullName.split("/")[0]
      const userInOrg = await isUserInOrg(token, triggeredByUser, org)
      if (!userInOrg) {
        res.status(403).send(`Not running because ${triggeredByUser} is not in ${org}.`)
        return
      }
    }

    const branch = "master"
    const file = await getGitHubFileContents(token, run.dangerfilePath || repo!.fullName, run.dangerfilePath, branch)

    const results = await runDangerAgainstInstallation(file, run.dangerfilePath, githubAPI, run.dslType)
    allResults.push(results)
  }

  const commentableRun = runs.find((run) => run.feedback === feedback.commentable)
  if (commentableRun) {

    const finalResults = allResults.reduce((curr: DangerResults, run: DangerResults) => {
      return {
        fails: [...curr.fails, ...run.fails],
        markdowns: [...curr.markdowns, ...run.markdowns],
        messages: [...curr.messages, ...run.messages],
        warnings: [...curr.warnings, ...run.warnings],
      }
    }, { fails: [], markdowns: [], warnings: [], messages: []})
    const issue = getIssueNumber(req.body)
    const githubAPI = githubAPIForCommentable(commentableRun, token, repo, issue)
    const exec = executorForInstallation(new GitHub(githubAPI))
    await exec.handleResults(finalResults[0])
  }
  console.log(allResults) // tslint:disable-line
}

// This doesn't feel great, but is OK for now
const getIssueNumber = (json: any): number | null => {
  if (json.pull_request) { return json.pull_request.number }
  if (json.issue) { return json.issue.number }
  return null
}

const githubAPIForCommentable
  = (run: DangerRun, token: string, repo: GithubRepo | null, issueNumber: number | null) => {

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
