import * as express from "express"

import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { ensureIntegrationIsUpToDate } from "../../api/github"
import {runDangerAgainstInstallation} from "../../danger/danger_runner"
import {getIntegration, GitHubIntegration} from "../../db/mongo"
import {PullRequestJSON} from "../types/pull_request"

export async function pullRequest(req: express.Request, res: express.Response) {
  res.status(200).send("pong")
  const pr: PullRequestJSON = req.body
  const action = pr.action
  const installationID = pr.installation.id

  switch (action) {
    case "opened":
    case "synchronize":
    case "closed":
      let integration = await getIntegration(installationID)
      integration = await ensureIntegrationIsUpToDate(integration)
      
      const githubAPI = new GitHubAPI(integration.accessToken, source)

      if (integration.onlyForOrgMembers) {
          
      }
      runDangerAgainstInstallation(pr, integration)
      break
    default: {
      console.log("Don't know this action")  // tslint:disable-line
    }
  }
}
