import * as express from "express"

import { Installation } from "../events/types/integration_installation_created.types"

import { GitHubInstallation } from "../../db"
import { getDB } from "../../db/getDB"

export async function createInstallation(installationJSON: Installation, _: express.Request, res: express.Response) {
  const installation: GitHubInstallation = {
    id: installationJSON.id,
    repos: {},
    rules: {
      pull_request: "dangerfile.js",
    },
    scheduler: {},
    settings: {
      env_vars: [],
      ignored_repos: [],
      modules: [],
    },
    tasks: {},
  }

  // Default to no runnerRules

  res.status(200).send("Creating new installation.")

  const db = getDB()
  await db.saveInstallation(installation)
}
