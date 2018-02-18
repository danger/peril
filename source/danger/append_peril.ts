import * as NodeGithub from "@octokit/rest"

import { PerilDSL } from "danger/distribution/dsl/DangerDSL"
import { DangerContext } from "danger/distribution/runner/Dangerfile"

import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { generateTaskSchedulerForInstallation } from "../tasks/scheduleTask"
import { InstallationToRun } from "./danger_runner"

/**
 * Genereates a GH API for Peril-based work
 *
 * @param installationID
 * @param authToken
 */
export const octokitAPIForPeril = async (installationID: number, authToken: string | undefined) => {
  const token = authToken || (await getTemporaryAccessTokenForInstallation(installationID))
  const api = new NodeGithub()

  api.authenticate({
    token,
    type: "integration",
  })

  return api
}

/**
 * Basically adds a re-authenticated GH API client for the Dangerfile
 * can either happen by passing in the installation ID to generate a new token, or
 * by passing in an existing token.
 *
 * Then adds the peril object into the DSL sandbox
 *
 * @param installationID
 * @param sandbox
 * @param peril
 */
export async function appendPerilContextToDSL(
  installationID: number,
  authToken: string | undefined,
  sandbox: DangerContext,
  peril: PerilDSL
) {
  if (sandbox.danger && sandbox.danger.github) {
    sandbox.danger.github.api = await octokitAPIForPeril(installationID, authToken)
  }

  const anySandbox = sandbox as any
  anySandbox.peril = peril
}

/**
 *  The main function for generating the Peril object for the DSL
 *
 * @param installation used to grab settings like the env vars
 * @param environment nearly always process.env in prod
 * @param peril an existing peril object, which will be splatted in
 */
export const perilObjectForInstallation = (
  installation: InstallationToRun,
  environment: any,
  peril: any
): PerilDSL => ({
  ...peril,
  env:
    installation.settings.env_vars &&
    Object.assign({}, ...installation.settings.env_vars.map(k => ({ [k]: environment[k] }))),
  runTask: generateTaskSchedulerForInstallation(installation.id),
})
