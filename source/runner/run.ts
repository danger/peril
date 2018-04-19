// I test this locally by renaming the .env file, then running:
//
// ❯ yarn build; cat source/runner/fixtures/branch-push.json | sed 's/12345/'"$DANGER_GITHUB_API_TOKEN"'/' | env DEBUG="*" node out/runner/index.js
// ❯
//
import logger from "../logger"

import { contextForDanger } from "danger/distribution/runner/Dangerfile"
import { jsonToDSL } from "danger/distribution/runner/jsonToDSL"
import inlineRunner from "danger/distribution/runner/runners/inline"

import { appendPerilContextToDSL, perilObjectForInstallation } from "../danger/append_peril"
import { dangerRepresentationForPath, dsl } from "../danger/danger_run"
import { executorForInstallation, InstallationToRun } from "../danger/danger_runner"
import { getPerilPlatformForDSL } from "../danger/peril_platform"
import { getGitHubFileContentsFromLocation } from "../github/lib/github_helpers"
import { PerilRunnerObject } from "./triggerSandboxRun"

import * as exitHook from "async-exit-hook"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { githubAPIForCommentable } from "../github/events/github_runner"

let runtimeEnv = {} as any

export const run = async (stdin: string) => {
  if (stdin.trim().length === 0) {
    logger.error("Got no STDIN")
    return
  }

  let input: PerilRunnerObject
  try {
    input = JSON.parse(stdin) as PerilRunnerObject
  } catch (error) {
    logger.error("STDIN was not JSON: ", stdin)
    return
  }

  logger.info(`Started run for ${input.path}`)
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
  // const platform = getPerilPlatformForDSL(dsl.import, null, input.dsl)
  // const exec = await executorForInstallation(platform, inlineRunner)

  // Create a DSL that is basically just the webhook
  const token = input.dsl.settings.github.accessToken
  const context = contextForDanger({ github: input.dsl.github } as any)
  const peril = perilObjectForInstallation(installation, process.env, input.peril)

  // Attach Peril + the octokit API to the DSL
  // TODO: This probably needs expanding to the util funcs etc
  await appendPerilContextToDSL(installation.id, token, context, peril)

  const dangerfileLocation = dangerRepresentationForPath(input.path)
  if (!dangerfileLocation.repoSlug) {
    logger.error(`No repo slug in ${input.path} given for event based run, which is not supported yet`)
    return
  }

  const dangerfileContent = await getGitHubFileContentsFromLocation(
    token,
    dangerfileLocation,
    dangerfileLocation.repoSlug!
  )

  runtimeEnv = await inlineRunner.createDangerfileRuntimeEnvironment(context)
  await inlineRunner.runDangerfileEnvironment(dangerfileLocation.dangerfilePath, dangerfileContent, runtimeEnv)
}

const runDangerPR = async (installation: InstallationToRun, input: PerilRunnerObject) => {
  const token = input.dsl.settings.github.accessToken

  if (!input.dsl.github) {
    logger.info(`Input DSL did not have a github object, ${input}`)
    return
  }

  const pr = input.dsl.github.pr
  const perilGHAPI = githubAPIForCommentable(token, pr.base.repo.full_name, pr.number)
  const perilGH = new GitHub(perilGHAPI)

  const platform = getPerilPlatformForDSL(dsl.pr, perilGH, input.dsl)
  const exec = await executorForInstallation(platform, inlineRunner)

  const runtimeDSL = await jsonToDSL(input.dsl)
  const context = contextForDanger(runtimeDSL)
  const peril = perilObjectForInstallation(installation, process.env, input.peril)
  await appendPerilContextToDSL(installation.id, token, context, peril)

  const dangerfileLocation = dangerRepresentationForPath(input.path)

  const defaultRepoSlug = input.dsl.github.pr.base.repo.full_name
  const dangerfileContent = await getGitHubFileContentsFromLocation(token, dangerfileLocation, defaultRepoSlug)

  runtimeEnv = await inlineRunner.createDangerfileRuntimeEnvironment(context)
  const results = await inlineRunner.runDangerfileEnvironment(
    dangerfileLocation.dangerfilePath,
    dangerfileContent,
    runtimeEnv
  )
  logger.info(
    `f: ${results.fails.length} w: ${results.warnings.length} m: ${results.messages.length} md: ${
      results.markdowns.length
    }`
  )

  // Wait till the end of the process to print out the results. Will
  // only post the results when the process has succeeded, leaving the
  // host process to create a message from the logs.
  exitHook((callback: () => void) => {
    logger.info(`Process finished, sending results`)
    exec.handleResultsPostingToPlatform(results, runtimeDSL.git).then(callback)
  })

  logger.info("Done")
}
