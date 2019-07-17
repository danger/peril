import { NextFunction, Request, Response } from "express"
import winston from "../logger"

import { githubDangerRunner } from "../github/events/github_runner"

import { installationLifeCycle } from "../plugins/installationLifeCycle"
import { installationSettingsUpdater } from "../plugins/installationSettingsUpdater"
import { recordWebhook } from "../plugins/recordWebhooks"
import { validatesGithubWebhook } from "../plugins/validatesGithubWebhook"

export const githubRouter = (req: Request, res: Response, next: NextFunction) => {
  const event = req.header("X-GitHub-Event")
  if (!event) {
    return
  }
  winston.info(`[router] -- Received ${event}:`)

  // Creating / Removing installations from the DB
  installationLifeCycle(event, req, res, next)

  // There are some webhook events that shouldn't be passed through to users/plugins
  if (webhookSkipListForPeril.includes(event)) {
    return
  }

  githubEventPluginHandler(event, req, res, next)

  // The Peril/Danger runner
  githubDangerRunner(event, req, res, next)
}

// TODO:
//   Type the plugins
//   Make a context obj with installation and others
//   Remove the next fn

export const githubEventPluginHandler = (event: string, req: Request, res: Response, next: NextFunction) => {
  // Use XHub to verify the request was sent from GH
  if (!validatesGithubWebhook(event, req, res, next)) {
    return
  }

  // Allow a dev mode
  recordWebhook(event, req, res, next)

  // Updating an install when the JSON changes
  installationSettingsUpdater(event, req, res, next)
}

// Installation addition/removal isn't too useful, and knowing when the repos
// have changed isn't of much value to peril considering how the JSON file is set up
export const webhookSkipListForPeril = ["integration_installation", "installation"]
