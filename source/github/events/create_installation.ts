import * as express from "express"

import { Installation } from "../events/types/integration_installation_created.types"

import { requestAccessTokenForInstallation } from "../../api/github"
import db, { GitHubInstallation } from "../../db"

export async function createInstallation(installationJSON: Installation, req: express.Request, res: express.Response) {
  const installation: GitHubInstallation = {
    id: installationJSON.id,
    rules: {
      pull_request: "dangerfile.js",
    },
    settings: {
      env_vars: [],
      ignored_repos: [],
      modules: [],
    },
  }

  // Default to no runnerRules

  res.status(200).send("Creating new installation.")
  await db.saveInstallation(installation)
}
