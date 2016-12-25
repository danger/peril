/* tslint:disable: no-var-requires */
const config = require("config")

import { GitHubIntegration } from "../db/mongo"
import { PullRequestJSON } from "../github/types/pull_request"

import { getCISourceForEnv } from "danger/distribution/ci_source/ci_source"
import { GitHub } from "danger/distribution/platforms/GitHub"
import Executor from "danger/distribution/runner/Executor"

import { writeFileSync } from "fs"
import { tmpdir } from "os"

export async function runDangerAgainstInstallation(pullRequest: PullRequestJSON, installation: GitHubIntegration) {
  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  const source = {
    env: process.env,
    isCI: true,
    isPR: true,
    name: "Peril",
    pullRequestID: String(pullRequest.pull_request.number),
    repoSlug: pullRequest.repository.full_name,
    supportedPlatforms: [],
  }

  if (config.has("LOG_FETCH_REQUESTS")) {
    global["verbose"] = true // tslint:disable-line
  }

  const gh = new GitHub(installation.accessToken, source)
  gh.additionalHeaders = { Accept: "application/vnd.github.machine-man-preview+json" }

  const exec = new Executor(source, gh)
  const dangerfile = await gh.fileContents("dangerfile.js")
  const localDangerfile = tmpdir() + "/dangerfile.js"
  writeFileSync(localDangerfile, dangerfile)
  exec.runDanger(localDangerfile)
}
