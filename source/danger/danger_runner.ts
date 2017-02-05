/* tslint:disable: no-var-requires */
const config = require("config")

import { ensureIntegrationIsUptodate } from "../api/github"
import { GitHubIntegration } from "../db/mongo"
import { PullRequestJSON } from "../github/types/pull_request"

import { getCISourceForEnv } from "danger/distribution/ci_source/get_ci_source"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { Executor } from "danger/distribution/runner/Executor"

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

  const integration = await ensureIntegrationIsUptodate(installation)
  const githubAPI = new GitHubAPI(integration.accessToken, source)
  githubAPI.additionalHeaders = { Accept: "application/vnd.github.machine-man-preview+json" }

  const gh = new GitHub(githubAPI)
  // gh.additionalHeaders = { Accept: "application/vnd.github.machine-man-preview+json" }

  const exec = new Executor(source, gh)
  const dangerfile = await githubAPI.fileContents("dangerfile.js")

  const localDangerfile = tmpdir() + "/dangerfile.js"
  writeFileSync(localDangerfile, dangerfile)

  const runtimeEnv = await exec.setupDanger()

  // This is where we can hook in and do the sandboxing
  runtimeEnv.environment.global.process = {}

  exec.runDanger(localDangerfile, runtimeEnv)
}
