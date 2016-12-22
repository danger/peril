import * as express from "express"

// import { fetch, getAccessTokenForIntegration } from "../../api/github"
import {runDangerAgainstInstallation} from "../../danger/danger_runner"
import {getIntegration, GitHubIntegration} from "../../db/mongo"
import {PullRequestJSON} from "../types/pull_request"

export async function pullRequest(req: express.Request, res: express.Response) {
  res.status(200).send("pong")
  const pr: PullRequestJSON = req.body
  const action = pr.action
  const installationID = pr.installation.id
  switch (action) {
    case "created":
    case "synchronize":
    case "closed":
      const integration = await getIntegration(installationID)
      runDangerAgainstInstallation(pr, integration)

    default:
  }
}


