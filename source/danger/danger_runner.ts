import { Platform } from "danger/distribution/platforms/platform"
import winston from "../logger"

import { GitHubInstallation } from "../db"
import { RootObject as PR } from "../github/events/types/pull_request_opened.types"

import { getCISourceForEnv } from "danger/distribution/ci_source/get_ci_source"
import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { runDangerfileEnvironment } from "danger/distribution/runner/DangerfileRunner"
import { Executor, ExecutorOptions } from "danger/distribution/runner/Executor"

import * as os from "os"
import * as path from "path"
import * as write from "write-file-promise"
import { dsl } from "./danger_run"

import perilPlatform from "./peril_platform"

/** Logs */
const log = (message: string) => {
  winston.info(`[runner] - ${message}`)
}

/**
 * The single function to run danger against an installation
 */
export async function runDangerAgainstInstallation(
  contents: string,
  filepath: string,
  api: GitHubAPI | null,
  type: dsl,
  dangerDSL?: any
) {
  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  log(`Running Danger`)
  const gh = api ? new GitHub(api) : null
  const platform = perilPlatform(type, gh, dangerDSL)

  const exec = await executorForInstallation(platform)

  const randomName = Math.random().toString(36)
  const localDangerfilePath = path.resolve(
    "../../dangerfile_runtime_env",
    "danger-" + randomName + path.extname(filepath)
  )

  return await runDangerAgainstFile(localDangerfilePath, contents, exec)
}

/**
 * Sets up the custom peril environment and runs danger against a local file
 */
export async function runDangerAgainstFile(filepath: string, contents: string, exec: Executor) {
  const runtimeEnv = await exec.setupDanger()
  // runtimeEnv.rquire.root = dangerfile_runtime_env
  let results: DangerResults
  try {
    results = await runDangerfileEnvironment(filepath, contents, runtimeEnv)
  } catch (error) {
    results = resultsForCaughtError(filepath, error)
  }
  return results
}

/** Returns Markdown results to post if an exception is raised during the danger run */
const resultsForCaughtError = (file: string, error: Error): DangerResults => {
  const failure = `Danger failed to run ${file}.`
  const errorMD = `## Error ${error.name}
\`\`\`
${error.message}

${error.stack}
\`\`\`
  `
  return { fails: [{ message: failure }], warnings: [], markdowns: [errorMD], messages: [] }
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
    repoSlug: "not used",
    supportedPlatforms: [],
  }

  const execConfig = {
    stdoutOnly: false,
    verbose: !!process.env.LOG_FETCH_REQUESTS,
  }
  // Source can be removed in the next release of Danger
  return new Executor(source, platform, execConfig)
}
