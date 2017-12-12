import { jsonDSLGenerator } from "danger/distribution/runner/dslGenerator"
import { jsonToDSL } from "danger/distribution/runner/jsonToDSL"
import perilPlatform from "../../danger/peril_platform"
import { GitHubInstallation, GithubRepo } from "../../db"

import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { dsl } from "../../danger/danger_run"

/**
 * Generates a full DSL for a PR
 *
 * @param githubAPI the Danger GithubAPI instance
 */
export const createPRDSL = async (githubAPI: GitHubAPI) => {
  const gh = new GitHub(githubAPI)
  const platform = perilPlatform(dsl.pr, gh, {})
  const jsonDSL = await jsonDSLGenerator(platform)
  return await jsonToDSL(jsonDSL)
}
