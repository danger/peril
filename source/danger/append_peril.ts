import { PerilDSL } from "danger/distribution/dsl/DangerDSL"

import * as NodeGithub from "@octokit/rest"

import { DangerContext } from "danger/distribution/runner/Dangerfile"
import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { generateTaskSchedulerForInstallation } from "../tasks/scheduleTask"
import { InstallationToRun } from "./danger_runner"

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
