const originalRequire = require
// @ts-ignore
require = rpath => {
  // tslint:disable-next-line:no-console
  console.log("Req dr: ", rpath)
  return originalRequire(rpath)
}

import { Platform } from "danger/distribution/platforms/platform"
import winston from "../logger"

import { DangerfileReferenceString } from "../db"
import { GitHubInstallationSettings } from "../db/GitHubRepoSettings"

import { PerilDSL } from "danger/distribution/dsl/DangerDSL"
import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { Executor, ExecutorOptions } from "danger/distribution/runner/Executor"
import { DangerRunner } from "danger/distribution/runner/runners/runner"
import vm2 from "danger/distribution/runner/runners/vm2"

import * as path from "path"
import { dsl } from "./danger_run"

import { contextForDanger } from "danger/distribution/runner/Dangerfile"
import { HYPER_ACCESS_KEY } from "../globals"
import { triggerSandboxDangerRun } from "../runner/triggerSandboxRun"
import { appendPerilContextToDSL, perilObjectForInstallation } from "./append_peril"
import perilPlatform from "./peril_platform"

/** Logs */
const log = (message: string) => winston.info(`[runner] - ${message}`)

export interface InstallationToRun {
  id: number
  settings: GitHubInstallationSettings
}

/**
 * The single function to run danger against an installation
 */
export async function runDangerForInstallation(
  contents: string,
  reference: DangerfileReferenceString,
  api: GitHubAPI | null,
  type: dsl,
  installation: InstallationToRun,
  dangerDSL?: any
) {
  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  log(`Running Danger`)
  const gh = api ? new GitHub(api) : null
  const platform = perilPlatform(type, gh, dangerDSL)

  const exec = await executorForInstallation(platform, vm2)

  const randomName = Math.random().toString(36)
  const localDangerfilePath = path.resolve("./" + "danger-" + randomName + path.extname(reference))
  const peril = perilObjectForInstallation(installation, process.env, dangerDSL && dangerDSL.peril)

  if (HYPER_ACCESS_KEY) {
    return await triggerSandboxDangerRun(type, installation, reference, dangerDSL, peril)
  } else {
    return await runDangerAgainstFileInline(localDangerfilePath, contents, installation, exec, peril, dangerDSL)
  }
}

/**
 * Sets up the custom peril environment and runs danger against a local file
 */
export async function runDangerAgainstFileInline(
  filepath: string,
  contents: string,
  installation: InstallationToRun,
  exec: Executor,
  peril: PerilDSL,
  dangerDSL?: any
) {
  const context = contextForDanger(dangerDSL)
  const runtimeEnv = await exec.runner.createDangerfileRuntimeEnvironment(context)

  // This can expand with time
  if (runtimeEnv.sandbox) {
    await appendPerilContextToDSL(installation.id, undefined, runtimeEnv.sandbox, peril)
  }

  let results: DangerResults

  try {
    results = await exec.runner.runDangerfileEnvironment(filepath, contents, runtimeEnv)
  } catch (error) {
    results = resultsForCaughtError(filepath, contents, error)
  }
  return results
}

/** Returns Markdown results to post if an exception is raised during the danger run */
export const resultsForCaughtError = (file: string, contents: string, error: Error): DangerResults => {
  const failure = `Danger failed to run \`${file}\`.`
  const errorMD = `## Error ${error.name}
\`\`\`
${error.message}

${error.stack}
\`\`\`

### Dangerfile

\`\`\`ts
${contents}
\`\`\`

  `
  return {
    fails: [{ message: failure }],
    warnings: [],
    markdowns: [errorMD],
    messages: [],
  }
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
export function executorForInstallation(platform: Platform, runner: DangerRunner) {
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

  const config: ExecutorOptions = {
    dangerID: "peril", // TODO: multiple Peril runs?
    jsonOnly: false,
    stdoutOnly: false,
    verbose: !!process.env.LOG_FETCH_REQUESTS,
  }

  // Source can be removed in the next release of Danger
  return new Executor(source, platform, runner, config)
}
