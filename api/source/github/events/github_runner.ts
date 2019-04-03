import * as express from "express"

import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { sentence } from "danger/distribution/runner/DangerUtils"
import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import {
  dangerRepresentationForPath,
  DangerRun,
  dangerRunForRules,
  RunFeedback,
  RunType,
} from "../../danger/danger_run"
import { GitHubInstallation, GithubRepo } from "../../db"
import { getDB } from "../../db/getDB"
import { GitHubInstallationSettings } from "../../db/GitHubRepoSettings"
import logger from "../../logger"
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
  const eventID = (req.headers["X-GitHub-Delivery"] as string) || "Unknown"

  return {
    commentableID: hasRelatedCommentable ? getIssueNumber(req.body) : null,
    eventID,
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

  const runs = runsForEvent(event, action, installation, req.body, settings)
  const name = action ? `${event}.${action}` : event
  const maybeRepo = req.body.repository ? `on ${req.body.repository.full_name}` : ""

  if (runs.length) {
    logger.info("")
    logger.info(`## ${name} on ${installation.login} ${maybeRepo}`)
    logger.info(
      `  ${runs.length} run${runs.length > 1 ? "s" : ""} needed: ${sentence(runs.map(r => r.referenceString))}`
    )
  } else {
    logger.info(`${name} on ${installation.login || "heroku"} ${maybeRepo} skipped`)
  }

  await runEverything(event, runs, settings, installation, req, res, next)
}

export function runsForEvent(
  event: string,
  action: string | null,
  installation: GitHubInstallation,
  webhook: any,
  settings: GitHubRunSettings
) {
  const settingsRepo = dangerRepresentationForPath(installation.perilSettingsJSONURL).repoSlug
  const installationRun = dangerRunForRules(event, action, installation.rules, webhook, settingsRepo)
  const repoRun = dangerRunForRules(event, action, settings.repoSpecificRules, webhook, settings.repoName || undefined)
  return [...installationRun, ...repoRun].filter(r => !!r) as DangerRun[]
}

export const runEverything = async (
  eventName: string,
  runs: DangerRun[],
  settings: GitHubRunSettings,
  installation: GitHubInstallation,
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
    logger.error(`No installation ID sent from GitHub.`)
    res.status(204).send(`No installation ID sent from GitHub.`)
    next()
    return
  }

  const token = await getTemporaryAccessTokenForInstallation(req.body.installation.id)
  const allResults = [] as DangerResults[]

  const prRuns = runs.filter(r => r.dslType === RunType.pr)
  const eventRuns = runs.filter(r => r.dslType === RunType.import)

  // Loop through all PRs, which are require difference DSL logic compared to simple GH webhook events
  const prResults = await runPRRun(eventName, prRuns, settings, token, req.body.pull_request || req.body)
  if (prResults) {
    allResults.push(prResults)
  }

  const eventResults = await runEventRun(eventName, eventRuns, settings, token, req.body)
  if (eventResults) {
    allResults.push(eventResults)
  }

  // TODO: Can this be deleted?
  const commentableRun = runs.find(r => r.feedback === RunFeedback.commentable)
  if (commentableRun && allResults.length) {
    const finalResults = mergeResults(allResults)
    logger.info(`Commenting, with results: ${mdResults(finalResults)}`)
    const isPRDSL = runs.find(r => r.dslType === RunType.pr) ? RunType.pr : RunType.import
    commentOnResults(isPRDSL, finalResults, token, settings, installation.settings)
  }

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
