/* tslint:disable: no-var-requires */
const config = require("config")
import { Platform } from "danger/distribution/platforms/platform"

import { GitHubInstallation } from "../db"
import { RootObject as PR } from "../github/events/types/pull_request_opened.types"

import { getCISourceForEnv } from "danger/distribution/ci_source/get_ci_source"
import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { runDangerfileEnvironment } from "danger/distribution/runner/DangerfileRunner"
import { Executor } from "danger/distribution/runner/Executor"

import { writeFileSync } from "fs"
import { tmpdir } from "os"
import { dsl } from "./danger_run"

import perilPlatform from "./peril_platform"

/**
 * The single function to run danger against an installation
 */
export async function  runDangerAgainstInstallation(contents: string, path: string, api: GitHubAPI | null, type: dsl) {
  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  const gh = api ? new GitHub(api) : null
  const platform = perilPlatform(type, gh, {})

  const exec = await executorForInstallation(platform)

  const localDangerfile = tmpdir() + "/" + path
  writeFileSync(localDangerfile, contents)

  return await runDangerAgainstFile(localDangerfile, exec)
}

/**
 * Sets up the custom peril environment and runs danger against a local file
 */
export async function runDangerAgainstFile(file: string, exec: Executor) {
  const runtimeEnv = await exec.setupDanger()

  // This is where we can hook in and do sandboxing
  runtimeEnv.environment.global.process = {
    argv: [],
    env: {}, // TODO: this could have stuff about repo/PR in it.
    stderr: process.stderr,
    stdin: process.stdin,
    stdout: process.stdout,
  }

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
export function executorForInstallation(platform: Platform) {

  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  const source = {
    env: process.env,
    isCI: true,
    isPR: true,
    name: "Peril",
    pullRequestID: "not used",
    repoSlug:  "not used",
    supportedPlatforms: [],
  }

  // The executor config should deprecate the need for this ideally

  if (config.has("LOG_FETCH_REQUESTS")) {
    global["verbose"] = true // tslint:disable-line
  }

  const execConfig = {
    stdoutOnly: false,
    verbose: config.has("LOG_FETCH_REQUESTS"),
  }

  // Source can be removed in the next release of Danger
  return new Executor(source, platform, execConfig)
}
