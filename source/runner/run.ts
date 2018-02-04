import logger from "../logger"

import { contextForDanger } from "danger/distribution/runner/Dangerfile"
import { jsonToDSL } from "danger/distribution/runner/jsonToDSL"
import inlineRunner from "danger/distribution/runner/runners/inline"

import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { perilObjectForInstallation } from "../danger/append_peril"
import { dangerRepresentationforPath, dsl } from "../danger/danger_run"
import { executorForInstallation, InstallationToRun } from "../danger/danger_runner"
import { getPerilPlatformForDSL } from "../danger/peril_platform"
import { getGitHubFileContentsFromLocation } from "../github/lib/github_helpers"
import { PerilRunnerObject } from "./triggerSandboxRun"

let runtimeEnv = {} as any

export const run = async (stdin: string) => {
  if (stdin.trim().length === 0) {
    logger.error("Got no STDIN")
    return
  } else {
    logger.info("Got STDIN: " + stdin)
  }

  let input: PerilRunnerObject
  try {
    input = JSON.parse(stdin) as PerilRunnerObject
  } catch (error) {
    logger.error("STDIN was not JSON: ", stdin)
    return
  }

  const installation = input.installation

  const dslMode = input.dslType === "pr" ? dsl.pr : dsl.import

  if (dslMode === dsl.pr) {
    await runDangerPR(installation, input)
  } else {
    await runDangerEvent(installation, input)
  }

  return null
}

// There's a lot of redundnacy between these, but at least they're somewhat separated in their mental
// model, used to be much harder to keep track of their diffferences

const runDangerEvent = async (installation: InstallationToRun, input: PerilRunnerObject) => {
  const token = await getTemporaryAccessTokenForInstallation(installation.id)

  // const platform = getPerilPlatformForDSL(dsl.import, null, input.dsl)
  // const exec = await executorForInstallation(platform, inlineRunner)

  // Create a DSL that is basically just the webhook
  // TODO: This probably needs expanding to the util funcs etc
  const context = contextForDanger({ github: input.dsl } as any)
  context.peril = perilObjectForInstallation(installation, process.env, input.peril)

  const dangerfileLocation = dangerRepresentationforPath(input.path)
  if (!dangerfileLocation.repoSlug) {
    logger.error(`No repo slug in ${input.path} given for event based run, which is not supported yet`)
    return
  }

  const dangerfile = await getGitHubFileContentsFromLocation(token, dangerfileLocation, dangerfileLocation.repoSlug!)

  runtimeEnv = await inlineRunner.createDangerfileRuntimeEnvironment(context)
  // if (runtimeEnv.sandbox) {
  //   await appendPerilContextToDSL(installation.id, undefined, runtimeEnv.sandbox, peril)
  // }
  await inlineRunner.runDangerfileEnvironment(dangerfile, undefined, runtimeEnv)
}

const runDangerPR = async (installation: InstallationToRun, input: PerilRunnerObject) => {
  const token = await getTemporaryAccessTokenForInstallation(installation.id)

  const platform = getPerilPlatformForDSL(dsl.pr, null, input.dsl)
  const exec = await executorForInstallation(platform, inlineRunner)

  const runtimeDSL = await jsonToDSL(input.dsl)
  const context = contextForDanger(runtimeDSL)
  context.peril = perilObjectForInstallation(installation, process.env, input.peril)

  const dangerfileLocation = dangerRepresentationforPath(input.path)

  const defaultRepoSlug = input.dsl.github.pr.base.repo.full_name
  const dangerfile = await getGitHubFileContentsFromLocation(token, dangerfileLocation, defaultRepoSlug)

  runtimeEnv = await inlineRunner.createDangerfileRuntimeEnvironment(context)
  const results = await inlineRunner.runDangerfileEnvironment(dangerfile, undefined, runtimeEnv)
  await exec.handleResultsPostingToPlatform(results)
  logger.info("Done")
}
