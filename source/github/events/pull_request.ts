import * as express from "express"

import { FakeCI } from "danger/distribution/ci_source/providers/Fake"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"

import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import {runDangerAgainstInstallation} from "../../danger/danger_runner"
import {getInstallation, GitHubInstallation} from "../../db/mongo"
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
      let installation = await getInstallation(installationID)
      const token = await getTemporaryAccessTokenForInstallation(installation)

      // Move to
      // api = new GitHubAPI({ repoSlug: "artsy/emission", pullRequestID: "1" }, "ABCDE")
      // with next Danger release

      const fakeCI = new FakeCI({ DANGER_TEST_REPO: pr.repository.full_name, DANGER_TEST_PR: pr.number })
      const githubAPI = new GitHubAPI(fakeCI, token)
      githubAPI.additionalHeaders = { Accept: "application/vnd.github.machine-man-preview+json" }

      // How can I get this from an API, if we cannot use /me
      // https://api.github.com/repos/PerilTest/PerilPRTester/issues/5/comments
      githubAPI.getUserID = () => Promise.resolve(24758014)

      if (installation.onlyForOrgMembers && await isUserInOrg(pr.sender, pr.organization.login, githubAPI)) {
        runDangerAgainstInstallation("dangerfile.js", pr, githubAPI)

      } else {
        runDangerAgainstInstallation("dangerfile.js", pr, githubAPI)
      }
      break
    default: {
      console.log("Don't know this action")  // tslint:disable-line
    }
  }
}
