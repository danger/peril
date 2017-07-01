import * as express from "express"
import winston from "../../logger"

import { PERIL_BOT_USER_ID } from "../../globals"

import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"

import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import { DangerRun, dangerRunForRules, dsl, feedback } from "../../danger/danger_run"
import { executorForInstallation, runDangerAgainstInstallation } from "../../danger/danger_runner"
import db, { GitHubInstallation, GithubRepo } from "../../db"
import { Pull_request } from "../events/types/pull_request_opened.types"
import { getGitHubFileContents, isUserInOrg } from "../lib/github_helpers"

/**
 * So, these function have a bunch of responsibilities.
 *
 *  - Validating there is an installation ref in the db
 *  - Generating runs for an installation, could be up to two (org + repo) per integration event
 *  - Going from a run to executing Danger for that run
 *  - Handling the varients in a Danger run
 *
 *    - Event is org based (no repo, DSL is event JSON)
 *    - Event is repo based (has a reference to a repo, but nothing to comment on)
 *    - Event is PR based (has a repo + issue, can comment, gets normal DangerDSL)
 *    - Event is issue based (has a repo + issue, can comment, gets event DSL )
 *
 *  - Passing back the feedback results, if we can
 *
 * As you can imagine, this does indeed make it ripe for a good refactoring in the future.
 */

/** Logs */
const log = (message: string) => {
  winston.info(`[runner] - ${message}`)
}

export interface GitHubRunSettings {
  commentableID: number | null
  isRepoEvent: boolean | null
  isTriggeredByUser: boolean
  repo: GithubRepo | null
  repoName: string | null
  triggeredByUsername: string | null
  hasRelatedCommentable: boolean
}

export const setupForRequest = async (req: express.Request): Promise<GitHubRunSettings> => {
  const isRepoEvent = !!req.body.repository
  const repoName = isRepoEvent && req.body.repository.full_name
  const installationID = req.body.installation.id as number
  const isTriggeredByUser = !!req.body.sender
  const hasRelatedCommentable = getIssueNumber(req.body) !== null

  return {
    commentableID: hasRelatedCommentable ? getIssueNumber(req.body) : null,
    hasRelatedCommentable,
    isRepoEvent,
    isTriggeredByUser,
    repo: isRepoEvent ? await db.getRepo(installationID, repoName) : null,
    repoName,
    triggeredByUsername: isTriggeredByUser ? req.body.sender.login : null,
  }
}

export const githubDangerRunner = async (event: string, req: express.Request, res: express.Response, next: any) => {
  const action = req.body.action as string | null
  const installationID = req.body.installation.id as number

  const installation = await db.getInstallation(installationID)
  if (!installation) {
    res.status(404).send(`Could not find installation with id: ${installationID}`)
    return
  }

  const settings = await setupForRequest(req)

  // TODO: Why did I make this call before?
  if (!settings.isRepoEvent) {
    res.status(404).send(`WIP - not built out support for non-repo related events - sorry`)
    return
  }

  const runs = runsForEvent(event, action, installation, settings)
  await runEverything(runs, settings, installation, req, res, next)
}

export function runsForEvent(event: string, action: string | null, installation: GitHubInstallation, settings: any) {
  const installationRun = dangerRunForRules(event, action, installation.rules)
  const repoRun = dangerRunForRules(event, action, settings.repo && settings.repo.rules)
  return [installationRun, repoRun].filter(r => !!r) as DangerRun[]
}

export const runEverything = async (
  runs: DangerRun[],
  settings: any,
  installation: GitHubInstallation,
  req: express.Request,
  res: express.Response,
  next: any
) => {
  // We got no runs ( so there were no rules that correspond to the event)
  if (runs.length === 0) {
    res.status(204).send(`No work to do.`)
    next()
    return
  }

  log(`Event Settings: ${JSON.stringify(settings, null, " ")}`)
  const token = await getTemporaryAccessTokenForInstallation(installation)

  const allResults = [] as DangerResults[]

  const prRuns = runs.filter(r => r.dslType === dsl.pr)
  const eventRuns = runs.filter(r => r.dslType !== dsl.import)

  // Loop through all PRs, which are definitely special cases compare to simple events
  for (const run of prRuns) {
    const results = await runPRRun(run, settings, token, req.body)
    if (results) {
      allResults.push(results)
    }
  }

  for (const run of eventRuns) {
    const results = await runEventRun(run, settings, token, req.body)
    if (results) {
      allResults.push(results)
    }
  }

  const commentableRun = runs.find(r => r.feedback === feedback.commentable)
  if (commentableRun && allResults.length) {
    const finalResults = mergeResults(allResults)
    log(`Commenting, with results: ${mdResults(finalResults)}`)
    commentOnResults(finalResults, token, settings)
  }

  res.status(200).send(`Run ${runs.length} Dangerfile${runs.length > 1 ? "s" : ""}`)
}

export const runEventRun = async (
  run: DangerRun,
  settings: any,
  token: string,
  dsl: any
): Promise<DangerResults | null> => {
  const repoForDangerfile = run.repoSlug || (dsl.repository && dsl.repository.full_name)
  if (!repoForDangerfile) {
    return null
  }

  const supportsGithubCommentAPIs = run.feedback === feedback.commentable

  // Do we need an authenticated Danger GitHubAPI instance so we
  // can leave feedback on an issue?
  let githubAPI = null as GitHubAPI | null
  if (supportsGithubCommentAPIs && settings.commentableID && settings.repo) {
    githubAPI = githubAPIForCommentable(token, settings.repo.fullName, settings.commentableID)
  }

  const headDangerfile = await getGitHubFileContents(token, repoForDangerfile, run.dangerfilePath, null)
  return await runDangerAgainstInstallation(headDangerfile, run.dangerfilePath, githubAPI, run.dslType)
}

export const runPRRun = async (
  run: DangerRun,
  settings: any,
  token: string,
  pr: Pull_request
): Promise<DangerResults | null> => {
  // Are we being extra paranoid about running Dangerfiles?
  // Ideally this can move to detect if the PR changed the Dangerfile also
  //
  // This feature is being dropped in favour of https://github.com/danger/peril/issues/95
  //
  // const onlyOrgPR = installation.settings.onlyForOrgMembers
  // if (onlyOrgPR && githubAPI && settings.repoName && settings.triggeredByUsername) {
  //   const org = settings.repoName.split("/")[0]
  //   const userInOrg = await isUserInOrg(token, settings.triggeredByUsername, org)
  //   if (!userInOrg) {
  //     res.status(403).send(`Not running because ${settings.triggeredByUsername} is not in ${org}.`)
  //     return null
  //   }
  // }

  const githubAPI = githubAPIForCommentable(token, settings.repo.fullName, settings.commentableID)

  // In theory only a PR requires a custom branch, so we can check directly for that
  // in the event JSON and if it's not there then use master
  // prioritise the run metadata

  const dangerfileRepoForPR = pr.head.repo.full_name
  const dangerfileBranchForPR = pr.head.ref
  const neededDangerfileIsSameRepo = run.repoSlug === pr.head.repo.full_name
  const branch = neededDangerfileIsSameRepo ? null : dangerfileBranchForPR

  // Either it's dictated in the run as an external repo, or we use the most natural repo
  const repoForDangerfile = run.repoSlug || dangerfileRepoForPR

  const headDangerfile = await getGitHubFileContents(token, repoForDangerfile, run.dangerfilePath, branch)

  const reportData = reason => {
    const stateForErrorHandling = {
      branch,
      dangerfileBranchForPR,
      neededDangerfileIsSameRepo,
      repoForDangerfile,
      run,
      settings,
    }

    return `${reason}

## Full state of PR run:

\`\`\`json      
${JSON.stringify(stateForErrorHandling, null, "  ")}
\`\`\`   
      `
  }

  if (headDangerfile !== "") {
    const results = await runDangerAgainstInstallation(headDangerfile, run.dangerfilePath, githubAPI, run.dslType)
    if (pr.body.includes("Peril: Debug")) {
      results.markdowns.push(reportData("Showing PR details due to including 'Peril: Debug'"))
    }
    return results
  } else {
    const actualBranch = branch ? branch : "master"
    const message = `Could not find Dangerfile at <code>${run.dangerfilePath}</code> on <code>${repoForDangerfile}</code> on branch <code>${actualBranch}</code>`

    const report = reportData("Could not find a Dangerfile at ")
    return { fails: [{ message: report }], markdowns: [], warnings: [], messages: [] }
  }
}

export const mdResults = (results: DangerResults): string => {
  return `
mds: ${results.markdowns.length}
mds: ${results.messages.length}
warns: ${results.warnings.length}
fails: ${results.fails.length}
  `
}

export const mergeResults = (results: DangerResults[]): DangerResults => {
  return results.reduce(
    (curr: DangerResults, newResults: DangerResults) => {
      return {
        fails: [...curr.fails, ...newResults.fails],
        markdowns: [...curr.markdowns, ...newResults.markdowns],
        messages: [...curr.messages, ...newResults.messages],
        warnings: [...curr.warnings, ...newResults.warnings],
      }
    },
    { fails: [], markdowns: [], warnings: [], messages: [] }
  )
}

export const commentOnResults = async (results: DangerResults, token, settings) => {
  const githubAPI = githubAPIForCommentable(token, settings.repoName, settings.commentableID)
  const exec = executorForInstallation(new GitHub(githubAPI))
  await exec.handleResults(results)
}

// This doesn't feel great, but is OK for now
const getIssueNumber = (json: any): number | null => {
  if (json.pull_request) {
    return json.pull_request.number
  }
  if (json.issue) {
    return json.issue.number
  }
  return null
}

// This doesn't feel great, but is OK for now
const getRepoSlug = (json: any): string | null => {
  if (json.repository) {
    return json.repository.full_name
  }
  return null
}

const githubAPIForCommentable = (token: string, repoSlug: string, issueNumber: number | null) => {
  const githubAPI = new GitHubAPI({ repoSlug, pullRequestID: String(issueNumber) }, token)
  githubAPI.additionalHeaders = { Accept: "application/vnd.github.machine-man-preview+json" }

  // How can I get this from an API, if we cannot use /me ?
  // https://api.github.com/repos/PerilTest/PerilPRTester/issues/5/comments
  // Talked to GH - they know it's an issue.
  githubAPI.getUserID = () => Promise.resolve(parseInt(PERIL_BOT_USER_ID as string, 10))
  return githubAPI
}

export default githubDangerRunner
