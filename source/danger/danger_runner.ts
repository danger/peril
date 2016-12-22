/* tslint:disable: no-var-requires */

const getCISourceForEnv = require("danger/ci_source/ci_source.js")
import {PullRequestJSON} from "../github/types/pull_request"

import {GitHubIntegration} from "../db/mongo"
const { GitHub } = require("danger/platforms/GitHub.js")
const { Executor } = require("danger/platforms/GitHub.js")

// import {GitHub} from "../../node_modules/danger/distribution/platforms/GitHub.js"

export function runDangerAgainstInstallation(pullRequest: PullRequestJSON, installation: GitHubIntegration) {
  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  const source = {
    env: process.env,
    isCI: true,
    isPR: true,
    name: "Peril",
    pullRequestID: String(pullRequest.pull_request.id),
    repoSlug: pullRequest.repository.full_name,
    supportedPlatforms: [],
  }

  const gh = new GitHub(installation.accessToken, source)
  const exec = new Executor(source, gh)
  exec.runDanger()
}
