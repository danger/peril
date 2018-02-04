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

export async function appendPerilContextToDSL(installationID: number, sandbox: DangerContext, peril: PerilDSL) {
  if (sandbox.danger && sandbox.danger.github) {
    const token = await getTemporaryAccessTokenForInstallation(installationID)
    const api = new NodeGithub()

    api.authenticate({
      token,
      type: "integration",
    })

    sandbox.danger.github.api = api
  }

  // TODO: Add this to the Danger DSL in Danger, as an optional
  const anySandbox = sandbox as any
  anySandbox.peril = peril
}

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
