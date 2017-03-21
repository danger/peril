import * as express from "express"

import { getAccessTokenForInstallation } from "../../api/github"
import {GitHubInstallation, saveInstallation} from "../../db/mongo"

export async function createInstallation(req: express.Request, res: express.Response) {
  res.status(200).send("pong")

  const installationID = req.body.installation.id

  const token = await getAccessTokenForInstallation(installationID)
  const credentials = await token.json()

  const installation: GitHubInstallation = {
    accessToken: credentials.token,
    account: req.body.installation.account,
    id: req.body.installation.id,
    sender: req.body.installation.sender,
    tokenExpires: credentials.expires_at,
  }

  await saveInstallation(installation)
}
