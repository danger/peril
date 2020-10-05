import * as NodeGithub from "@octokit/rest"

import { PerilDSL } from "danger/distribution/dsl/DangerDSL"
import { GitHubUtilsDSL } from "danger/distribution/dsl/GitHubDSL"
import GitHubUtils, {
  createOrAddLabel,
  createOrUpdatePR,
  createUpdatedIssueWithIDGenerator,
} from "danger/distribution/platforms/github/GitHubUtils"
import { DangerContext } from "danger/distribution/runner/Dangerfile"
import { href, sentence } from "danger/distribution/runner/DangerUtils"

import { basename } from "path"
import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { runtimeEnvironment } from "../db/getDB"
import { RuntimeEnvironment } from "../db/runtimeEnv"
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
  return new NodeGithub({
    auth: `token ${token}`,
  })
}

/**
 * When running an event with nothing to do with a PR
 * we need to have custom versions of these functions.
 *
 * @param api GitHub API instance
 */
const recreateGitHubUtils = (api: NodeGithub): GitHubUtilsDSL => ({
  fileLinks: (paths: string[], useBasename: boolean = true, repoSlug: string, branch?: string): string => {
    if (!repoSlug) {
      throw new Error("Need a repo slug")
    }
    const ref = branch || "master"

    const toHref = (path: string) => `https://github.com/${repoSlug}/blob/${ref}/${path}`
    // As we should only be getting paths we can ignore the nullability
    const hrefs = paths.map(p => href(toHref(p), useBasename ? basename(p) : p)) as string[]
    return sentence(hrefs)
  },

  // A one off version of file contents
  fileContents: async (path: string, repoSlug: string, ref?: string) => {
    if (!repoSlug) {
      throw new Error("fileContents must include a repo in an event")
    }

    const [owner, repo] = repoSlug.split("/")
    try {
      const response = await api.repos.getContents({ repo, owner, path, ref })
      if (response && response.data && response.data.type === "file") {
        const buffer = Buffer.from(response.data.content, response.data.encoding)
        return buffer.toString()
      } else {
        return ""
      }
    } catch {
      return ""
    }
  },

  createUpdatedIssueWithID: createUpdatedIssueWithIDGenerator(api),
  // TODO: Is this right?
  //       Do I need to move the PR object into here if needed?
  createOrAddLabel: createOrAddLabel(undefined as any, api),
  createOrUpdatePR: createOrUpdatePR(undefined as any, api),
})

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
  if (sandbox && sandbox.danger) {
    // @ts-ignore - .github is readonly according to the types, but we have to have something here
    sandbox.danger.github = sandbox.danger.github || ({} as any)
    const api = await octokitAPIForPeril(installationID, authToken)
    sandbox.danger.github.api = api

    if (sandbox.danger.github.pr && api) {
      sandbox.danger.github.utils = GitHubUtils(sandbox.danger.github.pr, api)
    } else if (api) {
      sandbox.danger.github.utils = recreateGitHubUtils(api)
    }

    sandbox.peril = peril
  }
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
  sandboxSettings?: PerilRunnerBootstrapJSON
): PerilDSL => {
  // get them by pulling out white-listed env vars
  const envVarsForSelfHosted = () =>
    installation.settings.env_vars &&
    Object.assign({}, ...installation.settings.env_vars.map(k => ({ [k]: environment[k] })))

  const env = runtimeEnvironment === RuntimeEnvironment.Standalone ? envVarsForSelfHosted() : environment

  return {
    env,
    runTask: generateTaskSchedulerForInstallation(installation.iID, sandboxSettings),
  }
}
