import * as express from "express"

import { requestAccessTokenForInstallation } from "../../api/github"
import {GitHubInstallation, saveInstallation} from "../../db/mongo"

export async function createInstallation(req: express.Request, res: express.Response) {
  res.status(200).send("pong")

  const installationID = req.body.installation.id

  const installation: GitHubInstallation = {
    account: req.body.installation.account,
    filepathForDangerfile: "dangerfile.js",
    id: req.body.installation.id,
    onlyForOrgMembers: true,
    sender: req.body.installation.sender,
  }

  await saveInstallation(installation)
}
