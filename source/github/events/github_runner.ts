import * as express from "express"
import winston from "../../logger"

import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"

import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import { DangerRun, dangerRunForRules, dsl, feedback } from "../../danger/danger_run"
import { executorForInstallation, runDangerAgainstInstallation } from "../../danger/danger_runner"
import { getInstallation, getRepo, GitHubInstallation, GithubRepo } from "../../db"
import { getGitHubFileContents, isUserInOrg } from "../lib/github_helpers"

/**
 * So, this function has a bunch of responsibilities.
 *
 *  - Validating there is an installation ref in the db
 *  - Getting (potential) repo information
 *  - Generating runs for an installation, could be up to two (org + repo) per integration event
 *  - Going frm a run to executing Danger for that run
 *  - Handling the varients in a Danger run
 *
 *    - Event is org based (no repo, DSL is event JSON)
 *    - Event is repo based (has a refernce to a repo, but nothing to comment on)
 *    - Event is PR based (has a repo + issue, can comment, gets normal DangerDSL)
 *    - Event is issue based (has a repo + issue, can comment, gets event DSL )
 *
 *  - Merging multiple results into one
 *  - Passing back the feedback results, if we can
 *
 * As you can imagine, this does indeed make it ripe for a good refactoring in the future.
 */

/** Logs */
const log = (message: string) => { winston.info(`[runner] - ${message}`) }

export async function githubDangerRunner(event: string, req: express.Request, res: express.Response) {
  const action = req.body.action as string | null
  const installationID = req.body.installation.id as number

  let installation = await getInstallation(installationID)
  if (!installation) {
    res.status(404).send(`Could not find installation with id: ${installationID}`)
    return
  }

  // The repo could definitely be null, for example: Org User Added
  // So, we need to assume from here on, that this data is not always available
  const fullRepoName = req.body.repository && req.body.repository.full_name as string | null
  let repo = null as GithubRepo | null
  if (fullRepoName) { repo = await getRepo(installationID, fullRepoName) }
  const runRepo = repo && repo.fullName || fullRepoName

  if (!runRepo) {
    res.status(404).send(`WIP - not built out support for non-repo related events - sorry`)
    
    return
  }

  const installationRun = dangerRunForRules(event, action, installation.rules)
  const repoRun = dangerRunForRules(event, action, repo && repo.rules)
  const runs = [installationRun, repoRun].filter((r) => !!r) as DangerRun[]

  // We got no runs ( so there were no rules that correspond to the event)
  if (runs.length === 0) {
    res.status(204).send(`No work to do.`)
    return
  }

  const token = await getTemporaryAccessTokenForInstallation(installation)

  const allResults = [] as DangerResults[]
  for (const run of runs) {
    log(`Running: ${JSON.stringify(run, null, " ")}`)

    const useFullDangerDSL = run.dslType === dsl.pr
    const supportGithubCommentAPIs = run.feedback === feedback.commentable

    log(`Use fullDSL: ${useFullDangerDSL}`)
    log(`supportGithubCommentAPIs: ${supportGithubCommentAPIs}`)
    log(`runRepo: ${runRepo}`)

    // Do we need an authenticated Danger GitHubAPI instance so we
    // can leave feedback on an issue?
    let githubAPI = null as GitHubAPI | null
    if (supportGithubCommentAPIs && runRepo) {
      const issue = getIssueNumber(req.body)
      // const repoSlug = getRepoSlug(req.body)
      // TODO: An org could refer to a dangerfile that's not in the current repo
      githubAPI = githubAPIForCommentable(run, token, runRepo, issue)
      log("Got GitHub API")
    }

    // Are we being extra paranoid about running Dangerfiles?
    const triggeredByUser = req.body.sender as any | null
    if (triggeredByUser && githubAPI && repo && installation && installation.settings.onlyForOrgMembers) {
      log("Checking if user is in org")
      const org = fullRepoName!.split("/")[0]
      const userInOrg = await isUserInOrg(token, triggeredByUser, org)
      if (!userInOrg) {
        res.status(403).send(`Not running because ${triggeredByUser} is not in ${org}.`)
        return
      }
    }

    // In theory only a PR requires a custom branch, so we can check directly for that
    // in the event JSON and if it's not there then use master
    const branch = req.body.pull_request ? req.body.pull_request.head.ref : "master"
    const file = await getGitHubFileContents(token, repo && repo.fullName || fullRepoName!, run.dangerfilePath, branch)

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
    }, { fails: [], markdowns: [], warnings: [], messages: [] })

    const issue = getIssueNumber(req.body)
    const githubAPI = githubAPIForCommentable(commentableRun, token, runRepo, issue)
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

// This doesn't feel great, but is OK for now
const getRepoSlug = (json: any): string | null => {
  if (json.repository) { return json.repository.full_name }
  return null
}

const githubAPIForCommentable
  = (run: DangerRun, token: string, repoSlug: string, issueNumber: number | null) => {

    const githubAPI = new GitHubAPI({ repoSlug, pullRequestID: String(issueNumber) }, token)
    githubAPI.additionalHeaders = { Accept: "application/vnd.github.machine-man-preview+json" }

    // How can I get this from an API, if we cannot use /me ?
    // https://api.github.com/repos/PerilTest/PerilPRTester/issues/5/comments
    githubAPI.getUserID = () => Promise.resolve(24758014)
    return githubAPI
  }

export default githubDangerRunner
