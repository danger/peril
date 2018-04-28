import { NextFunction, Request, Response } from "express"
import winston from "../logger"

import { githubDangerRunner } from "../github/events/github_runner"

import { installationLifeCycle } from "../plugins/installationLifeCycle"
import { installationSettingsUpdater } from "../plugins/installationSettingsUpdater"
import { validatesGithubWebhook } from "../plugins/validatesGithubWebhook"

export const githubRouter = (req: Request, res: Response, next: NextFunction) => {
  const event = req.header("X-GitHub-Event")
  winston.log("router", `Received ${event}:`)

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
  // Creating / Removing installations from the DB
  installationLifeCycle(event, req, res, next)

  // Updating an install when the JSON changes
  installationSettingsUpdater(event, req, res, next)
}
