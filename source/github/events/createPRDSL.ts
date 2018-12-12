import { jsonDSLGenerator } from "danger/distribution/runner/dslGenerator"
import { jsonToDSL } from "danger/distribution/runner/jsonToDSL"
import { getPerilPlatformForDSL } from "../../danger/peril_platform"

import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { RunType } from "../../danger/danger_run"
import { source } from "../../danger/peril_ci_source"

/**
 * Generates a full DSL for a PR
 *
 * @param githubAPI the Danger GithubAPI instance
 */
export const createPRDSL = async (githubAPI: GitHubAPI) => {
  const jsonDSL = await createPRJSONDSL(githubAPI)
  return await jsonToDSL(jsonDSL, source)
}

/**
 * Generates a full DSL for a PR
 *
 * @param githubAPI the Danger GithubAPI instance
 */
export const createPRJSONDSL = async (githubAPI: GitHubAPI) => {
  const gh = GitHub(githubAPI)
  const platform = getPerilPlatformForDSL(RunType.pr, gh, {})
  // These are what Danger JS uses to pass info to sub-commands
  // peril scopes all of its settings elsewhere, so a blank is fine
  const cliArgs = {} as any
  return await jsonDSLGenerator(platform, source, cliArgs)
}
