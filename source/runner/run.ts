// I test this locally by renaming the .env file, then running:
//
// ❯ yarn build; cat source/github/events/handlers/_tests/fixtures/PerilRunnerEventBootStrapExample.json | sed 's/12345/'"$DANGER_GITHUB_API_TOKEN"'/' | env DEBUG="*" node out/runner/index.js
// ❯

// If you want to be testing this via hyper
//  yarn build; cat source/runner/fixtures/hello-world.json  | sed 's/12345/'"$DANGER_GITHUB_API_TOKEN"'/' | hyper func call danger-peril-staging-debug

// Alternatively, to switch staging's runner to be a debug runner:
// ❯ hyper func update --env "DEBUG='*'" peril-staging
// and back with
// ❯ hyper func update --env "DEBUG=''" peril-staging

import * as exitHook from "async-exit-hook"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { contextForDanger } from "danger/distribution/runner/Dangerfile"
import { jsonToDSL } from "danger/distribution/runner/jsonToDSL"
import inlineRunner from "danger/distribution/runner/runners/inline"
import * as overrideRequire from "override-require"
import { graphqlAPI } from "../api/graphql/api"
import { gql } from "../api/graphql/gql"
import { appendPerilContextToDSL, perilObjectForInstallation } from "../danger/append_peril"
import { dangerRepresentationForPath, RunType } from "../danger/danger_run"
import { executorForInstallation, InstallationToRun, ValidatedPayload } from "../danger/danger_runner"
import { source } from "../danger/peril_ci_source"
import { getPerilPlatformForDSL } from "../danger/peril_platform"
import { githubAPIForCommentable } from "../github/events/utils/commenting"
import { getGitHubFileContentsFromLocation } from "../github/lib/github_helpers"
import logger from "../logger"
import { customGitHubResolveRequest, perilPrefix, shouldUseGitHubOverride } from "./customGitHubRequire"
import { PerilRunnerBootstrapJSON } from "./triggerSandboxRunFromExternalHost"

let runtimeEnv = {} as any
const startTime = new Date().getTime()

export const run = async (stdin: string) => {
  if (stdin.trim().length === 0) {
    logger.error("Got no STDIN")
    return
  }

  // Get STDIN and convert it into a Peril obj
  let input: PerilRunnerBootstrapJSON
  try {
    input = JSON.parse(stdin) as PerilRunnerBootstrapJSON
  } catch (error) {
    logger.error("STDIN was not JSON: ", stdin)
    return
  }

  logger.info(`Started run for ${input.paths.join(", ")}`)
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

const runDangerEvent = async (
  installation: InstallationToRun,
  input: PerilRunnerBootstrapJSON,
  payload: ValidatedPayload
) => {
  // Pull out the metadata from the JSON to load up the danger process
  const token = payload.dsl.settings.github.accessToken
  const context = contextForDanger({ github: payload.dsl.github } as any)
  const peril = await perilObjectForInstallation(installation, input.perilSettings.envVars, input)

  // Attach Peril + the octokit API to the DSL
  await appendPerilContextToDSL(installation.iID, token, context, peril)

  for (const path of input.paths) {
    const rep = dangerRepresentationForPath(path)
    if (!rep.repoSlug) {
      logger.error(`No repo slug in ${path} given for event based run, which can't really be supported.`)
      return
    }
  }

  // Start getting the details for what code to eval.

  // Provide a prefix to files so that we know what requires are based on a dangerfile relative path
  const paths = input.paths.map(p => `${perilPrefix}${p}`)
  // Grab all the contents before to pass into the runner
  const contents: string[] = []
  for (const path of input.paths) {
    const rep = dangerRepresentationForPath(path)
    const dangerfileContent = await getGitHubFileContentsFromLocation(token, rep, rep.repoSlug!)
    contents.push(dangerfileContent)
  }

  exitHook((callback: () => void) => {
    logger.info(`Process finished, sending results`)
    postResultsCall(
      input.perilSettings.perilAPIRoot,
      input.perilSettings.perilJWT,
      input.perilSettings.event,
      input.paths,
      1234,
      process.env.HYPER_CALL_ID || ""
    ).then(callback)
  })

  runtimeEnv = await inlineRunner.createDangerfileRuntimeEnvironment(context)

  // Use custom module resolution inside the danger env
  const restoreOriginalModuleLoader = overrideRequire(shouldUseGitHubOverride, customGitHubResolveRequest(token))
  await inlineRunner.runDangerfileEnvironment(paths, contents, runtimeEnv, payload.webhook)

  // Restore the original module loader.
  restoreOriginalModuleLoader()
}

const runDangerPR = async (
  installation: InstallationToRun,
  input: PerilRunnerBootstrapJSON,
  payload: ValidatedPayload
) => {
  if (!payload.dsl.github) {
    logger.error("PR payload did not have a github")
    return
  }

  const token = payload.dsl.settings.github.accessToken
  const pr = payload.dsl.github.pr

  const perilGHAPI = githubAPIForCommentable(token, pr.base.repo.full_name, pr.number)
  const perilGH = GitHub(perilGHAPI)

  const platform = getPerilPlatformForDSL(RunType.pr, perilGH, payload.dsl)
  const exec = await executorForInstallation(platform, inlineRunner, input.perilSettings)

  // Set up the Danger runtime env
  const runtimeDSL = await jsonToDSL(payload.dsl, source)
  const context = contextForDanger(runtimeDSL)
  const peril = await perilObjectForInstallation(installation, input.perilSettings.envVars, input)
  await appendPerilContextToDSL(installation.iID, token, context, peril)

  // Provide a prefix to files so that we know what requires are based on a dangerfile relative path
  const paths = input.paths.map(p => `${perilPrefix}${p}`)

  // Grab all the contents before to pass into the runner
  const contents: string[] = []
  for (const path of input.paths) {
    const rep = dangerRepresentationForPath(path)

    const defaultRepoSlug = payload.dsl.github.pr.base.repo.full_name
    const dangerfileContent = await getGitHubFileContentsFromLocation(token, rep, defaultRepoSlug)
    contents.push(dangerfileContent)
  }

  // Because it's not feasible to get stderr from hyper
  process.stderr.write = process.stdout.write

  // Run it
  runtimeEnv = await inlineRunner.createDangerfileRuntimeEnvironment(context)
  // Use custom module resolution inside the danger env
  const restoreOriginalModuleLoader = overrideRequire(shouldUseGitHubOverride, customGitHubResolveRequest(token))
  const results = await inlineRunner.runDangerfileEnvironment(paths, contents, runtimeEnv)
  restoreOriginalModuleLoader()

  // Give a small summary
  logger.info(
    `f: ${results.fails.length} w: ${results.warnings.length} m: ${results.messages.length} md: ${
      results.markdowns.length
    }`
  )

  // Wait till the end of the process to print out the results. Will
  // only post the results when the process has succeeded, leaving the
  // host process to create a message from the logs.
  exitHook((callback: () => void) => {
    const endTime = new Date().getTime()
    const duration = (startTime - endTime) / 1000
    logger.info(`Danger run finished in ${duration}, sending results`)

    Promise.all([
      postResultsCall(
        input.perilSettings.perilAPIRoot,
        input.perilSettings.perilJWT,
        input.perilSettings.event,
        input.paths,
        duration,
        process.env.HYPER_CALL_ID || ""
      ),
      exec.handleResultsPostingToPlatform(results, runtimeDSL.git),
    ]).then(callback)
  })

  logger.info("Done")
}

const postResultsCall = (
  url: string,
  jwt: string,
  name: string,
  dangerfiles: string[],
  time: number,
  hyperID: string
) =>
  graphqlAPI(
    url,
    gql`
  mutation {
    dangerfileFinished(
      jwt: "${jwt}",
      name: "${name}",
      dangerfiles: [${dangerfiles.map(d => `"${d}"`).join(", ")}],
      time: ${time},
      hyperCallID: "${hyperID}"
    ) {
      success
    }
  }
`
  )
