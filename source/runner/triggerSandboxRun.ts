import * as uuid from "uuid/v1"
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

  const runUUID = uuid()
  logger.info(`Calling hyper function with id ${runUUID}`)
  const call = await callHyperFunction(runUUID, stdOUT)
  logger.info(`Response: ${call}`)
  if (call.CallId) {
    logger.info(`Check logs via:`)
    logger.info(`> hyper func logs ${HYPER_FUNC_NAME} --callid ${call.callID}`)
  }
}
