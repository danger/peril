import { DangerDSLJSONType, PerilDSL } from "danger/distribution/dsl/DangerDSL"
import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { Platform } from "danger/distribution/platforms/platform"
import { contextForDanger } from "danger/distribution/runner/Dangerfile"
import { Executor, ExecutorOptions } from "danger/distribution/runner/Executor"
import { DangerRunner } from "danger/distribution/runner/runners/runner"
import vm2 from "danger/distribution/runner/runners/vm2"
import * as path from "path"

import { DangerfileReferenceString } from "../db"
import { GitHubInstallationSettings } from "../db/GitHubRepoSettings"
import { HYPER_ACCESS_KEY } from "../globals"
import { triggerSandboxDangerRun } from "../runner/triggerSandboxRun"
import { appendPerilContextToDSL, perilObjectForInstallation } from "./append_peril"
import { RunType } from "./danger_run"
import { getPerilPlatformForDSL } from "./peril_platform"

export interface InstallationToRun {
  iID: number
  settings: GitHubInstallationSettings
}

/** The DSL / injected obj for the Danger run, before it's set up */
export interface Payload {
  // The Danger DSL when the event is a PR
  dsl: DangerDSLJSONType | {}
  // The webhook for anything else
  webhook: any
}

/** Once we're more certain of the payload */
export interface ValidatedPayload {
  // The Danger DSL when the event is a PR
  dsl: DangerDSLJSONType
  // The webhook for anything else
  webhook: any
}

/**
 * The single function to run danger against an installation
 */
export async function runDangerForInstallation(
  contents: string[],
  references: DangerfileReferenceString[],
  api: GitHubAPI | null,
  type: RunType,
  installation: InstallationToRun,
  payload: Payload
) {
  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  const DSL = payload.dsl
  const gh = api ? GitHub(api) : null
  const platform = getPerilPlatformForDSL(type, gh, payload.dsl)

  const exec = await executorForInstallation(platform, vm2)

  const randomName = Math.random().toString(36)
  const localDangerfilePaths = references.map(ref => path.resolve("./" + "danger-" + randomName + path.extname(ref)))

  // Allow custom peril funcs to come from the task/scheduler DSL
  const perilFromRunOrTask = DSL && (DSL as any).peril
  const peril = await perilObjectForInstallation(installation, process.env, perilFromRunOrTask)

  if (HYPER_ACCESS_KEY) {
    return await triggerSandboxDangerRun(type, installation, references, payload, peril)
  } else {
    return await runDangerAgainstFileInline(localDangerfilePaths, contents, installation, exec, peril, payload)
  }
}

/**
 * Sets up the custom peril environment and runs danger against a local file
 */
export async function runDangerAgainstFileInline(
  filepath: string[],
  contents: string[],
  installation: InstallationToRun,
  exec: Executor,
  peril: PerilDSL,
  payload: Payload
) {
  const dangerDSL = payload.dsl as any | undefined
  const context = contextForDanger(dangerDSL)
  const runtimeEnv = await exec.runner.createDangerfileRuntimeEnvironment(context)

  if (runtimeEnv.sandbox) {
    // Mutates runtimeEnv.sandbox
    await appendPerilContextToDSL(installation.iID, undefined, runtimeEnv.sandbox, peril)
  }

  let results: DangerResults

  try {
    results = await exec.runner.runDangerfileEnvironment(filepath, contents, runtimeEnv, payload.webhook)
  } catch (error) {
    results = resultsForCaughtError(filepath.join(","), contents.join("\n---\n"), error)
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
    markdowns: [{ message: errorMD }],
    messages: [],
  }
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
    accessTokenIsGitHubApp: true,
  }

  // Source can be removed in the next release of Danger
  return new Executor(source, platform, runner, config)
}
