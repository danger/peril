import * as express from "express"

import { FakeCI } from "danger/distribution/ci_source/providers/Fake"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"

import { ensureIntegrationIsUpToDate } from "../../api/github"
import {runDangerAgainstInstallation} from "../../danger/danger_runner"
import {getIntegration, GitHubIntegration} from "../../db/mongo"
import {isUserInOrg} from "../lib/github_helpers"
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

      // Move to
      //  api = new GitHubAPI({ repoSlug: "artsy/emission", pullRequestID: "1" }, "ABCDE")
      // with next Danger release

      const fakeCI = new FakeCI({ DANGER_TEST_REPO: pr.repository.full_name, DANGER_TEST_PR: pr.number })
      const githubAPI = new GitHubAPI(fakeCI, integration.accessToken)
      githubAPI.additionalHeaders = { Accept: "application/vnd.github.machine-man-preview+json" }

      if (integration.onlyForOrgMembers && await isUserInOrg(pr.sender, pr.organization.login, githubAPI)) {
        runDangerAgainstInstallation(integration.filepathForDangerfile, pr, githubAPI)

      } else {
        runDangerAgainstInstallation(integration.filepathForDangerfile, pr, githubAPI)
      }
      break
    default: {
      console.log("Don't know this action")  // tslint:disable-line
    }
  }
}
