import logger from "../logger"

import { HYPER_FUNC_NAME } from "../globals"
import { callHyperFunction } from "../runner/hyper-api"

import { DangerDSLJSONType } from "danger/distribution/dsl/DangerDSL"
import { DangerfileReferenceString } from "../db/index"

import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { dsl } from "../danger/danger_run"
import { InstallationToRun } from "../danger/danger_runner"

// Sidenote: auth token is in  dsl.settings.github
export interface PerilRunnerObject {
  /** The DSL for JSON, could be a DangerDSLJSON type or the raw webhook */
  dsl: DangerDSLJSONType // | any
  /** The refernce for the initial dangerfile */
  path: DangerfileReferenceString
  /** Installation number */
  installation: InstallationToRun
  /** DSL type */
  dslType: "pr" | "run"
  /** Optional Peril settings? (think like task) */
  // TODO: Make a PerilJSONDSL
  peril: any

  // TODO: Validate the source came from Peril - public key based on the GH private one?
}

// You can fake this by doing something like:
//
// cat source/runner/fixtures/branch-push.json | sed 's/12345/'"$DANGER_GITHUB_API_TOKEN"'/' | hyper func call danger-peril-staging
//

/** This function is used inside Peril */
export const triggerSandboxDangerRun = async (
  type: dsl,
  installation: InstallationToRun,
  path: DangerfileReferenceString,
  dslJSON: DangerDSLJSONType,
  peril: any
) => {
  const token = await getTemporaryAccessTokenForInstallation(installation.id)

  dslJSON.settings = {
    github: {
      accessToken: token,
      baseURL: undefined, // used for GH Enterprise, not supported today
      additionalHeaders: { Accept: "application/vnd.github.machine-man-preview+json" },
    },
    cliArgs: {} as any,
  }

  const stdOUT: PerilRunnerObject = {
    installation,
    dsl: dslJSON,
    dslType: type === dsl.pr ? "pr" : "run",
    peril,
    path,
  }

  logger.info(`Calling hyper function`)
  logger.info("JSON Sent: ", JSON.stringify(stdOUT, null, "  "))

  const call = await callHyperFunction(stdOUT)
  const callID = JSON.parse(call).CallId
  if (callID) {
    logger.info(`Check logs for ${path} with:`)
    logger.info(`> hyper func logs --tail=all --callid ${callID} ${HYPER_FUNC_NAME}`)
  }
}
