import { DangerDSLJSONType, PerilDSL } from "danger/distribution/dsl/DangerDSL"
import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { Platform } from "danger/distribution/platforms/platform"
import { contextForDanger } from "danger/distribution/runner/Dangerfile"
import { Executor, ExecutorOptions } from "danger/distribution/runner/Executor"
import vm2 from "danger/distribution/runner/runners/inline"
import { DangerRunner } from "danger/distribution/runner/runners/runner"
import * as path from "path"

import { DangerfileReferenceString } from "../db"
import { runtimeEnvironment } from "../db/getDB"
import { GitHubInstallationSettings } from "../db/GitHubRepoSettings"
import { RuntimeEnvironment } from "../db/runtimeEnv"
import { triggerSandboxDangerRun } from "../runner/triggerSandboxRun"
import { appendPerilContextToDSL, perilObjectForInstallation } from "./append_peril"
import { RunType } from "./danger_run"
import { source } from "./peril_ci_source"
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
 * The single function to run danger against an installationRun
 */
export async function runDangerForInstallation(
  eventName: string,
  contents: string[],
  references: DangerfileReferenceString[],
  api: GitHubAPI | null,
  type: RunType,
  installationRun: InstallationToRun,
  payload: Payload
) {
  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  const DSL = payload.dsl
  const gh = api ? GitHub(api) : null
  const platform = getPerilPlatformForDSL(type, gh, payload.dsl)

  const exec = await executorForInstallation(platform, vm2, installationRun.settings)

  const localDangerfilePaths = references.map(ref =>
    path.resolve("./" + "danger-" + Math.random().toString(36) + path.extname(ref))
  )

  // Allow custom peril funcs to come from the task/scheduler DSL
  if (runtimeEnvironment === RuntimeEnvironment.Standalone) {
    const perilFromRunOrTask = DSL && (DSL as any).peril
    const peril = await perilObjectForInstallation(installationRun, process.env, perilFromRunOrTask)
    return await runDangerAgainstFileInline(localDangerfilePaths, contents, installationRun, exec, peril, payload)
  } else {
    return await triggerSandboxDangerRun(eventName, type, installationRun, references, payload)
  }
}

/**
 * Sets up the custom peril environment and runs danger against a local file
 */
export async function runDangerAgainstFileInline(
  filepath: string[],
  contents: string[],
  installationRun: InstallationToRun,
  exec: Executor,
  peril: PerilDSL,
  payload: Payload
) {
  const dangerDSL = payload.dsl as any | undefined
  const context = contextForDanger(dangerDSL)
  const dangerRuntimeEnv = await exec.runner.createDangerfileRuntimeEnvironment(context)

  if (dangerRuntimeEnv.sandbox) {
    // Mutates runtimeEnv.sandbox
    await appendPerilContextToDSL(installationRun.iID, undefined, dangerRuntimeEnv.sandbox, peril)
  }

  let results: DangerResults

  try {
    results = await exec.runner.runDangerfileEnvironment(filepath, contents, dangerRuntimeEnv, payload.webhook)
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
 * Generates a Danger Executor based on the installationRun's context
 */
export function executorForInstallation(platform: Platform, runner: DangerRunner, options: GitHubInstallationSettings) {
  // We need this for things like repo slugs, PR IDs etc
  // https://github.com/danger/danger-js/blob/master/source/ci_source/ci_source.js

  const config: ExecutorOptions = {
    dangerID: "peril", // TODO: multiple Peril runs?
    jsonOnly: false,
    stdoutOnly: false,
    verbose: !!process.env.LOG_FETCH_REQUESTS,
    disableGitHubChecksSupport: options.disable_github_check,
    passURLForDSL: false,
  }

  // Source can be removed in the next release of Danger
  return new Executor(source, platform, runner, config)
}
