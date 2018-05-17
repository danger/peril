// I test this locally by renaming the .env file, then running:
//
// ❯ yarn build; cat source/runner/fixtures/branch-push.json | sed 's/12345/'"$DANGER_GITHUB_API_TOKEN"'/' | env DEBUG="*" node out/runner/index.js
// ❯
//

import * as exitHook from "async-exit-hook"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { contextForDanger } from "danger/distribution/runner/Dangerfile"
import { jsonToDSL } from "danger/distribution/runner/jsonToDSL"
import inlineRunner from "danger/distribution/runner/runners/inline"

import { appendPerilContextToDSL, perilObjectForInstallation } from "../danger/append_peril"
import { dangerRepresentationForPath, RunType } from "../danger/danger_run"
import { executorForInstallation, InstallationToRun, ValidatedPayload } from "../danger/danger_runner"
import { getPerilPlatformForDSL } from "../danger/peril_platform"
import { githubAPIForCommentable } from "../github/events/utils/commenting"
import { getGitHubFileContentsFromLocation } from "../github/lib/github_helpers"
import logger from "../logger"
import { PerilRunnerObject } from "./triggerSandboxRun"

let runtimeEnv = {} as any

export const run = async (stdin: string) => {
  if (stdin.trim().length === 0) {
    logger.error("Got no STDIN")
    return
  }

  // Get STDIN and convert it into a Peril obj
  let input: PerilRunnerObject
  try {
    input = JSON.parse(stdin) as PerilRunnerObject
  } catch (error) {
    logger.error("STDIN was not JSON: ", stdin)
    return
  }

  logger.info(`Started run for ${input.path}`)
  const installation = input.installation

  // Validate the JSON
  if (!input.payload.dsl) {
    logger.error("Received a payload without github metadata")
    return
  }

  // Remove the nulls from the payload as by this point it should be set up
  const payload = input.payload as ValidatedPayload
  const dslMode = input.dslType === "pr" ? RunType.pr : RunType.import

  // Run the job
  if (dslMode === RunType.pr && input.payload.dsl) {
    await runDangerPR(installation, input, payload)
  } else {
    // Pass the webhook right through
    await runDangerEvent(installation, input, payload)
  }

  return null
}

// There's a lot of redundancy between these, but at least they're somewhat separated in their mental
// model, used to be much harder to keep track of their differences

const runDangerEvent = async (installation: InstallationToRun, input: PerilRunnerObject, payload: ValidatedPayload) => {
  // Pull out the metadata from the JSON to load up the danger process
  const token = payload.dsl.settings.github.accessToken
  const context = contextForDanger({ github: payload.dsl.github } as any)
  const peril = await perilObjectForInstallation(installation, process.env, input.peril)

  // Attach Peril + the octokit API to the DSL
  await appendPerilContextToDSL(installation.iID, token, context, peril)

  const rep = dangerRepresentationForPath(input.path)
  if (!rep.repoSlug) {
    logger.error(`No repo slug in ${input.path} given for event based run, which is not supported yet`)
    return
  }

  const dangerfileContent = await getGitHubFileContentsFromLocation(token, rep, rep.repoSlug!)

  runtimeEnv = await inlineRunner.createDangerfileRuntimeEnvironment(context)
  await inlineRunner.runDangerfileEnvironment([rep.dangerfilePath], [dangerfileContent], runtimeEnv, payload.webhook)
}

const runDangerPR = async (installation: InstallationToRun, input: PerilRunnerObject, payload: ValidatedPayload) => {
  if (!payload.dsl.github) {
    logger.error("PR payload did not have a github")
    return
  }

  const token = payload.dsl.settings.github.accessToken
  const pr = payload.dsl.github.pr

  const perilGHAPI = githubAPIForCommentable(token, pr.base.repo.full_name, pr.number)
  const perilGH = GitHub(perilGHAPI)

  const platform = getPerilPlatformForDSL(RunType.pr, perilGH, payload.dsl)
  const exec = await executorForInstallation(platform, inlineRunner)

  const runtimeDSL = await jsonToDSL(payload.dsl)
  const context = contextForDanger(runtimeDSL)
  const peril = await perilObjectForInstallation(installation, process.env, input.peril)
  await appendPerilContextToDSL(installation.iID, token, context, peril)

  const rep = dangerRepresentationForPath(input.path)

  const defaultRepoSlug = payload.dsl.github.pr.base.repo.full_name
  const dangerfileContent = await getGitHubFileContentsFromLocation(token, rep, defaultRepoSlug)

  runtimeEnv = await inlineRunner.createDangerfileRuntimeEnvironment(context)
  const results = await inlineRunner.runDangerfileEnvironment([rep.dangerfilePath], [dangerfileContent], runtimeEnv)

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
