import logger from "../logger"

import { HYPER_FUNC_NAME } from "../globals"
import { callHyperFunction } from "../runner/hyper-api"

import { DangerDSLJSONType } from "danger/distribution/dsl/DangerDSL"
import { DangerfileReferenceString } from "../db/index"

import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { dsl } from "../danger/danger_run"

export interface PerilRunnerObject {
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

  logger.info(`Calling hyper function`)
  const call = await callHyperFunction(stdOUT)
  const callID = JSON.parse(call).CallId
  if (callID) {
    logger.info(`Check logs via:`)
    logger.info(`> hyper func logs --callid ${callID} ${HYPER_FUNC_NAME}`)
  }
}
