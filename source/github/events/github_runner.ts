import * as express from "express"

import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import { DangerRun, dangerRunForRules, RunFeedback, RunType } from "../../danger/danger_run"
import { GitHubInstallation, GithubRepo } from "../../db"
import { getDB } from "../../db/getDB"
import { GitHubInstallationSettings } from "../../db/GitHubRepoSettings"
import logger from "../../logger"
import winston from "../../logger"
import { runEventRun } from "./handlers/event"
import { runPRRun } from "./handlers/pr"
import { actionForWebhook } from "./utils/actions"
import { commentOnResults, getIssueNumber } from "./utils/commenting"
import { repoIsIgnored } from "./utils/ignore_repos"

/**
 * So, these function have a bunch of responsibilities.
 *
 *  - Validating there is an installation ref in the db
 *  - Generating runs for an installation, could be up to two (org + repo) per integration event
 *  - Going from a run to executing Danger for that run
 *  - Handling the variants in a Danger run
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

const log = (message: string) => winston.info(`[runner] - ${message}`)

export interface GitHubRunSettings {
  commentableID: number | null
  isRepoEvent: boolean | null
  isTriggeredByUser: boolean
  repoSpecificRules: any
  repoName: string | null
  triggeredByUsername: string | null
  hasRelatedCommentable: boolean
  eventID: string
  installationID: number
  installationSettings: GitHubInstallationSettings
}

export const getRepoSpecificRules = (installation: GitHubInstallation, repoName: string): GithubRepo | null => {
  const repos = installation.repos
  if (!repos[repoName]) {
    return null
  }

  const repo: GithubRepo = {
    fullName: repoName,
    installationID: installation.iID,
    rules: repos[repoName],
  }

  return repo
}

export const setupForRequest = async (req: express.Request, installationSettings: any): Promise<GitHubRunSettings> => {
  const isRepoEvent = !!req.body.repository
  const repoName = isRepoEvent && req.body.repository.full_name
  const installationID = req.body.installation.id as number
  const db = getDB()
  const installation = await db.getInstallation(installationID)
  const isTriggeredByUser = !!req.body.sender
  const hasRelatedCommentable = getIssueNumber(req.body) !== null
  const dbRepo = isRepoEvent ? getRepoSpecificRules(installation!, repoName) : null
  const repoSpecificRules = dbRepo && dbRepo.rules ? dbRepo.rules : {}

  return {
    commentableID: hasRelatedCommentable ? getIssueNumber(req.body) : null,
    eventID: req.headers["X-GitHub-Delivery"] || "Unknown",
    hasRelatedCommentable,
    installationID,
    installationSettings,
    isRepoEvent,
    isTriggeredByUser,
    repoName,
    repoSpecificRules,
    triggeredByUsername: isTriggeredByUser ? req.body.sender.login : null,
  }
}

export const githubDangerRunner = async (event: string, req: express.Request, res: express.Response, next: any) => {
  const action = actionForWebhook(req.body)
  const installationID = req.body.installation.id as number

  const db = getDB()
  const installation = await db.getInstallation(installationID)
  if (!installation) {
    res.status(404).send({ error: `Could not find installation`, iID: installationID })
    return
  }

  // If there's not a settings path, then we can't do anything
  if (!installation.perilSettingsJSONURL) {
    res.status(204).send({ error: `The installation has no settings path`, iID: installationID })
    return
  }

  const settings = await setupForRequest(req, installation.settings)
  // Allow edge-case repos to skip Danger rules. E.g. in Artsy, our analytics and marketing repos
  // do not need the same level of thought as an larger engineering project would.
  if (repoIsIgnored(settings.repoName, installation)) {
    res.status(204).send({ message: `Skipping peril run due to repo being in ignored`, iID: installationID })
    return
  }

  // Some events aren't tied to a repo (like creating a user) and so
  // right now I've not thought through what is necessary to run those
  if (!settings.isRepoEvent) {
    res
      .status(404)
      .send({ error: `WIP - not built out support for non-repo related events - sorry`, iID: installationID })
    return
  }

  const runs = runsForEvent(event, action, installation, req.body, settings)
  const name = action ? `${event}.${action}` : event
  if (runs.length) {
    logger.info("")
    logger.info(`## ${name} on ${installation.login}`)
    logger.info(`   ${runs.length} runs needed: ${runs.map(r => r.dangerfilePath).join(", ")}`)
  } else {
    logger.info(`${name} on ${installation.login} skipped`)
  }

  await runEverything(runs, settings, installation, req, res, next)
}

export function runsForEvent(
  event: string,
  action: string | null,
  installation: GitHubInstallation,
  webhook: any,
  settings: GitHubRunSettings
) {
  const installationRun = dangerRunForRules(event, action, installation.rules, webhook)
  const repoRun = dangerRunForRules(event, action, settings.repoSpecificRules, webhook)
  return [...installationRun, ...repoRun].filter(r => !!r) as DangerRun[]
}

export const runEverything = async (
  runs: DangerRun[],
  settings: GitHubRunSettings,
  _: GitHubInstallation,
  req: express.Request,
  res: express.Response,
  next: any
) => {
  // We got no runs ( so there were no rules that correspond to the event)
  if (runs.length === 0) {
    res.status(204).send(`No work to do {.`)
    next()
    return
  }

  if (!req.body.installation || !req.body.installation.id) {
    res.status(204).send(`No installation ID sent from GitHub.`)
    next()
    return
  }

  const token = await getTemporaryAccessTokenForInstallation(req.body.installation.id)
  const allResults = [] as DangerResults[]

  const prRuns = runs.filter(r => r.dslType === RunType.pr)
  const eventRuns = runs.filter(r => r.dslType === RunType.import)

  // Loop through all PRs, which are require difference DSL logic compared to simple GH webhook events
  for (const run of prRuns) {
    const results = await runPRRun(run, settings, token, req.body.pull_request || req.body)
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

  const commentableRun = runs.find(r => r.feedback === RunFeedback.commentable)
  if (commentableRun && allResults.length) {
    const finalResults = mergeResults(allResults)
    log(`Commenting, with results: ${mdResults(finalResults)}`)
    const isPRDSL = runs.find(r => r.dslType === RunType.pr) ? RunType.pr : RunType.import
    commentOnResults(isPRDSL, finalResults, token, settings)
  }

  // TODO: Get the hyper function metadata into here
  const status = `Run ${runs.length} Dangerfile${runs.length > 1 ? "s" : ""}`
  res.status(200).send(JSON.stringify({ status, results: allResults }, null, "  "))
}

export const mdResults = (results: DangerResults): string => {
  return `
mds: ${results.markdowns.length}
messages: ${results.messages.length}
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
