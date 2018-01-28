import * as getSTDIN from "get-stdin"
import * as nodeCleanup from "node-cleanup"
import { extname, resolve } from "path"
import uuid from "uuid/v1"

import logger from "../logger"

import { DangerDSLJSONType } from "danger/distribution/dsl/DangerDSL"
import { DangerfileReferenceString, GitHubInstallation } from "../db/index"

import { GitHub } from "danger/distribution/platforms/GitHub"
import { contextForDanger } from "danger/distribution/runner/Dangerfile"
import { jsonToDSL } from "danger/distribution/runner/jsonToDSL"
import inlineRunner from "danger/distribution/runner/runners/inline"

import { getTemporaryAccessTokenForInstallation } from "api/github"
import { perilObjectForInstallation } from "../danger/append_peril"
import { dangerRepresentationforPath, dsl } from "../danger/danger_run"
import { executorForInstallation } from "../danger/danger_runner"
import { getPerilPlatformForDSL } from "../danger/peril_platform"
import db from "../db/getDB"
import { getGitHubFileContents, getGitHubFileContentsFromLocation } from "../github/lib/github_helpers"

import { HYPER_FUNC_NAME } from "globals"
import { callHyperFunction } from "runner/hyper-api"

interface PerilRunnerObject {
  /** The DSL for JSON, could be a DangerDSLJSON type or the raw webhook */
  dsl: DangerDSLJSONType // | any
  /** The refernce for the initial dangerfile */
  path: DangerfileReferenceString
  /** github token */
  token: string
  /** Installation number */
  installationID: number
  /** DSL type */
  dslType: "pr" | "run"
  /** Optional Peril settings? (think like task) */
  // TODO: Make a PerilJSONDSL
  peril: any

  // TODO: Validate the source came from Peril - public key based on the GH private one?
}

/** This function is used inside Peril */
export const triggerSandboxDangerRun = async (
  type: dsl,
  installationID: number,
  path: DangerfileReferenceString,
  dslJSON: any,
  peril: any
) => {
  const token = await getTemporaryAccessTokenForInstallation(installationID)
  const stdOUT: PerilRunnerObject = {
    installationID,
    dsl: dslJSON,
    dslType: type === dsl.pr ? "pr" : "run",
    token,
    peril,
    path,
  }

  const runUUID = uuid()
  logger.info(`Calling hyper function with id ${runUUID}`)
  const call = await callHyperFunction(runUUID, stdOUT)
  logger.info(`Response: ${call}`)
  if (call.CallId) {
    logger.info(`Check logs via:`)
    logger.info(`> hyper func logs ${HYPER_FUNC_NAME} --callid ${call.callID}`)
  }
}

let foundDSL = false
let runtimeEnv = {} as any

const run = async (stdin: string) => {
  foundDSL = true
  logger.info("Got STDIN: " + stdin)

  const input = JSON.parse(stdin) as PerilRunnerObject
  const installation = await db.getInstallation(input.installationID)
  if (!installation) {
    logger.error("Could not find an installation")
    return
  }

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

const runDangerEvent = async (installation: GitHubInstallation, input: PerilRunnerObject) => {
  const token = await getTemporaryAccessTokenForInstallation(installation.id)

  const platform = getPerilPlatformForDSL(dsl.import, null, input.dsl)
  const exec = await executorForInstallation(platform, inlineRunner)

  const randomName = Math.random().toString(36)
  const localDangerfilePath = resolve("./" + "danger-" + randomName + "-event")

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
  await inlineRunner.runDangerfileEnvironment(dangerfile, undefined, runtimeEnv)
}

const runDangerPR = async (installation: GitHubInstallation, input: PerilRunnerObject) => {
  const token = await getTemporaryAccessTokenForInstallation(installation.id)

  const platform = getPerilPlatformForDSL(dsl.pr, null, input.dsl)
  const exec = await executorForInstallation(platform, inlineRunner)

  const randomName = Math.random().toString(36)
  const localDangerfilePath = resolve("./" + "danger-" + randomName + "-event")

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

// Wait till the end of the process to print out the results. Will
// only post the results when the process has succeeded, leaving the
// host process to create a message from the logs.
nodeCleanup((exitCode: number, signal: string) => {
  logger.info(`Process has finished with ${exitCode} ${signal}, sending the results back to the host process`)
  if (foundDSL) {
    // TODO: Failure cases?
    logger.info("TODO")
    // runtimeEnv.results
  }
})

// Add a timeout so that CI doesn't run forever if something has broken.
setTimeout(() => {
  if (!foundDSL) {
    logger.error("Timeout: Failed to get the PerilRunnerObject after 1 second")
    process.exitCode = 1
    process.exit(1)
  }
}, 1000)

// Start waiting on STDIN for the DSL
getSTDIN().then(run)
