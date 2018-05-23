import * as NodeGithub from "@octokit/rest"

import { PerilDSL } from "danger/distribution/dsl/DangerDSL"
import GitHubUtils from "danger/distribution/platforms/github/GitHubUtils"
import { DangerContext } from "danger/distribution/runner/Dangerfile"

import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { getDB, isSelfHosted } from "../db/getDB"
import { MongoDB } from "../db/mongo"
import { PerilRunnerBootstrapJSON } from "../runner/triggerSandboxRun"
import { generateTaskSchedulerForInstallation } from "../tasks/scheduleTask"
import { InstallationToRun } from "./danger_runner"

/**
 * Generates a GH API for Peril-based work
 *
 * @param installationID
 * @param authToken
 */
export const octokitAPIForPeril = async (installationID: number, authToken: string | undefined) => {
  const token = authToken || (await getTemporaryAccessTokenForInstallation(installationID))
  const api = new NodeGithub()

  api.authenticate({
    token,
    type: "app",
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
  // Update the GitHub related details with the new ocktokit generated per installation
  if (sandbox.danger) {
    // @ts-ignore - .github is readonly according to the types, but we have to have something here
    sandbox.danger.github = sandbox.danger.github || ({} as any)
    sandbox.danger.github.api = await octokitAPIForPeril(installationID, authToken)
    if (sandbox.danger.github.pr && sandbox.danger.github.api) {
      sandbox.danger.github.utils = GitHubUtils(sandbox.danger.github.pr, sandbox.danger.github.api)
    }
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
export const perilObjectForInstallation = async (
  installation: InstallationToRun,
  environment: any,
  peril: any | undefined,
  sandboxSettings?: PerilRunnerBootstrapJSON
): Promise<PerilDSL> => {
  const envVarsForSelfHosted = () =>
    installation.settings.env_vars &&
    Object.assign({}, ...installation.settings.env_vars.map(k => ({ [k]: environment[k] })))

  const getEnvVars = async () => {
    const db = getDB() as MongoDB
    const dbInstallation = await db.getInstallation(installation.iID)
    return dbInstallation ? dbInstallation.envVars || {} : {}
  }

  return {
    ...peril,
    env: isSelfHosted ? envVarsForSelfHosted() : await getEnvVars(),
    runTask: generateTaskSchedulerForInstallation(installation.iID, sandboxSettings),
  }
}
