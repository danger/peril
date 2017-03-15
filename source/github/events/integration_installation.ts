import * as express from "express"

import { getAccessTokenForIntegration } from "../../api/github"
import {GitHubIntegration, saveIntegration} from "../../db/mongo"

export async function integrationInstallation(req: express.Request, res: express.Response) {
  res.status(200).send("pong")

  const installationID = req.body.installation.id

  const token = await getAccessTokenForIntegration(installationID)
  const credentials = await token.json()

  const installation: GitHubIntegration = {
    accessToken: credentials.token,
    account: req.body.installation.account,
    id: req.body.installation.id,
    sender: req.body.installation.sender,
    tokenExpires: credentials.expires_at, 
  }

  await saveIntegration(installation)
}
