import logger from "../logger"
logger.info("--1")
import { PerilDSL } from "danger/distribution/dsl/DangerDSL"
logger.info("--2")
import * as NodeGithub from "@octokit/rest"
logger.info("--3")
import { DangerContext } from "danger/distribution/runner/Dangerfile"
logger.info("--4")
import { getTemporaryAccessTokenForInstallation } from "../api/github"
logger.info("--5")
import { generateTaskSchedulerForInstallation } from "../tasks/scheduleTask"
logger.info("--6")
import { InstallationToRun } from "./danger_runner"
logger.info("--7")

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
    const token = authToken || (await getTemporaryAccessTokenForInstallation(installationID))
    const api = new NodeGithub()

    api.authenticate({
      token,
      type: "integration",
    })

    sandbox.danger.github.api = api
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

logger.info("--8")
