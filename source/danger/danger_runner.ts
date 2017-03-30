/* tslint:disable: no-var-requires */
const config = require("config")

import { GitHubInstallation } from "../db/mongo"
import { PullRequestJSON } from "../github/types/pull_request"

import { getCISourceForEnv } from "danger/distribution/ci_source/get_ci_source"
import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { runDangerfileEnvironment } from "danger/distribution/runner/DangerfileRunner"
import { Executor } from "danger/distribution/runner/Executor"

import { writeFileSync } from "fs"
import { tmpdir } from "os"

/**
 * The single function to run danger against an installation
 */
export async function runDangerAgainstInstallation(path: string, pullRequest: PullRequestJSON, api: GitHubAPI) {
  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  const exec = await executorForInstallation(api)
  const dangerfile = await api.fileContents(path)

  const localDangerfile = tmpdir() + "/" + path
  writeFileSync(localDangerfile, dangerfile)

  const results = await runDangerAgainstFile(localDangerfile, exec)
  handleDangerResults(results, exec)
  return results
}

/**
 * Sets up the custom peril environment and runs danger against a local file
 */
export async function runDangerAgainstFile(file: string, exec: Executor) {
  const runtimeEnv = await exec.setupDanger()

  // This is where we can hook in and do sandboxing
  runtimeEnv.environment.global.process = {}

  return await runDangerfileEnvironment(file, runtimeEnv)
}

/**
 * Let's Danger handle the results, as well as providing a hook for Peril to do work
 */
export async function handleDangerResults(results: DangerResults, exec: Executor) {
  return await exec.handleResults(results)
}

/**
 * Generates a Danger Executor based on the installation's context
 */
export function executorForInstallation(api: GitHubAPI) {

    // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  const source = {
    env: process.env,
    isCI: true,
    isPR: true,
    name: "Peril",
    pullRequestID: api.repoMetadata.pullRequestID,
    repoSlug:  api.repoMetadata.repoSlug,
    supportedPlatforms: [],
  }

  // The executor config should deprecate the need for this ideally

  if (config.has("LOG_FETCH_REQUESTS")) {
    global["verbose"] = true // tslint:disable-line
  }

  const gh = new GitHub(api)

  const execConfig = {
    stdoutOnly: false,
    verbose: config.has("LOG_FETCH_REQUESTS"),
  }

  return new Executor(source, gh, execConfig)
}
