import * as express from 'express'

import { getAccessTokenForIntegration, fetch } from "../../api/github"
import {GitHubIntegration, saveIntegration} from "../../db/mongo"

export async function integrationInstallation(req: express.Request, res: express.Response) {
  res.status(200).send("pong")

  const installationID = req.body.installation.id

  const token = await getAccessTokenForIntegration(installationID)
  const credentials = await token.json()

  const installation: GitHubIntegration = {
    id: req.body.installation.id,
    account: req.body.installation.account,
    sender: req.body.installation.sender,
    accessToken: credentials.token,
    tokenExpires: credentials.expires_at
  }

  await saveIntegration(installation)

}
