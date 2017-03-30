import * as express from "express"

import { FakeCI } from "danger/distribution/ci_source/providers/Fake"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"

import { RootObject as PR } from "./types/pull_request_opened.types"

import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import {runDangerAgainstInstallation} from "../../danger/danger_runner"
import {getInstallation, GitHubInstallation} from "../../db/mongo"
import {isUserInOrg} from "../lib/github_helpers"

export async function pullRequest(pr: PR, req: express.Request, res: express.Response) {

  const action = pr.action
  const installationID = pr.installation.id

  switch (action) {
    case "opened":
    case "synchronize":
    case "closed":
      let installation = await getInstallation(installationID)
      if (!installation) {
          res.status(404).send(`Could not find installation with id: ${installationID}`)
      } else {
          res.status(200).send("Found installation")
      }
      const token = await getTemporaryAccessTokenForInstallation(installation)

      const githubAPI = new GitHubAPI({ repoSlug: pr.repository.full_name, pullRequestID: String(pr.number) }, token)
      githubAPI.additionalHeaders = { Accept: "application/vnd.github.machine-man-preview+json" }

      // How can I get this from an API, if we cannot use /me ?
      // https://api.github.com/repos/PerilTest/PerilPRTester/issues/5/comments
      githubAPI.getUserID = () => Promise.resolve(24758014)

      if (installation.onlyForOrgMembers && await isUserInOrg(pr.sender as any, pr.organization.login, githubAPI)) {
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
