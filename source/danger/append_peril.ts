import { Platform } from "danger/distribution/platforms/platform"
import winston from "../logger"

import { GitHubInstallation } from "../db"
import { GitHubInstallationSettings } from "../db/GitHubRepoSettings"
import { RootObject as PR } from "../github/events/types/pull_request_opened.types"

import { getCISourceForEnv } from "danger/distribution/ci_source/get_ci_source"
import { PerilDSL } from "danger/distribution/dsl/DangerDSL"
import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { Executor, ExecutorOptions } from "danger/distribution/runner/Executor"
import inlineRunner from "danger/distribution/runner/runners/vm2"

import * as NodeGithub from "@octokit/rest"

import { getTemporaryAccessTokenForInstallation } from "api/github"
import { contextForDanger, DangerContext } from "danger/distribution/runner/Dangerfile"
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
