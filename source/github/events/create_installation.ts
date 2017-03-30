import * as express from "express"

import { requestAccessTokenForInstallation } from "../../api/github"
import { GitHubInstallation, saveInstallation } from "../../db/mongo"

export async function createInstallation(req: express.Request, res: express.Response) {

  const installationID = req.body.installation.id

  const installation: GitHubInstallation = {
    id: req.body.installation.id,
    settings: {
      filepathForDangerfile: "dangerfile.js",
      onlyForOrgMembers: true,
    },
  }

  res.status(200).send("Creating new installation.")
  await saveInstallation(installation)
}
