import { Platform } from "danger/distribution/platforms/platform"
import winston from "../logger"

import { GitHubInstallation } from "../db"
import { GitHubInstallationSettings } from "../db/GitHubRepoSettings"
import { RootObject as PR } from "../github/events/types/pull_request_opened.types"

import { getCISourceForEnv } from "danger/distribution/ci_source/get_ci_source"
import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { Executor, ExecutorOptions } from "danger/distribution/runner/Executor"
import inlineRunner from "danger/distribution/runner/runners/vm2"

import * as NodeGithub from "github"

import * as os from "os"
import * as path from "path"
import * as write from "write-file-promise"
import { dsl } from "./danger_run"

import { contextForDanger, DangerContext } from "danger/distribution/runner/Dangerfile"
import { getTemporaryAccessTokenForInstallation } from "../api/github"
import perilPlatform from "./peril_platform"

/** Logs */
const log = (message: string) => winston.info(`[runner] - ${message}`)

// What does the Peril object look like inside the runtime
// TODO: Expose this usefully somehow
export interface PerilDSL {
  // A list of accepted ENV vars into the peril runtime, configurable in settings.
  env: any | false
}

export interface InstallationToRun {
  id: number
  settings: GitHubInstallationSettings
}

/**
 * The single function to run danger against an installation
 */
export async function runDangerForInstallation(
  contents: string,
  filepath: string,
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

  const exec = await executorForInstallation(platform)

  const randomName = Math.random().toString(36)
  const localDangerfilePath = path.resolve("./" + "danger-" + randomName + path.extname(filepath))
  const peril = perilObjectForInstallation(installation.settings, process.env)

  return await runDangerAgainstFile(localDangerfilePath, contents, installation, exec, peril, dangerDSL)
}

export const perilObjectForInstallation = (settings: GitHubInstallationSettings, environment: any): PerilDSL => ({
  env: settings.env_vars && Object.assign({}, ...settings.env_vars.map(k => ({ [k]: environment[k] }))),
})

/**
 * Sets up the custom peril environment and runs danger against a local file
 */
export async function runDangerAgainstFile(
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
    await appendPerilContextToDSL(installation.id, runtimeEnv.sandbox, peril)
  }

  // runtimeEnv.rquire.root = dangerfile_runtime_env
  let results: DangerResults

  try {
    results = await exec.runner.runDangerfileEnvironment(filepath, contents, runtimeEnv)
  } catch (error) {
    results = resultsForCaughtError(filepath, contents, error)
  }
  return results
}

/** Returns Markdown results to post if an exception is raised during the danger run */
const resultsForCaughtError = (file: string, contents: string, error: Error): DangerResults => {
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

  const config: ExecutorOptions = {
    dangerID: "peril", // TODO: multiple Peril runs?
    jsonOnly: false,
    stdoutOnly: false,
    verbose: !!process.env.LOG_FETCH_REQUESTS,
  }

  const execConfig = {}
  // Source can be removed in the next release of Danger
  return new Executor(source, platform, inlineRunner, config)
}

export async function appendPerilContextToDSL(installationID: number, sandbox: DangerContext, peril: PerilDSL) {
  if (sandbox.danger && sandbox.danger.github) {
    const token = await getTemporaryAccessTokenForInstallation(installationID)
    const api = new NodeGithub()

    api.authenticate({
      token,
      type: "integration",
    })

    sandbox.danger.github.api = api
  }

  // TODO: Add this to the Danger DSL in Danger, as an optional
  const anySandbox = sandbox as any
  anySandbox.peril = peril
}
