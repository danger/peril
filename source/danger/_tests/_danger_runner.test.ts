import { FakeCI } from "danger/distribution/ci_source/providers/Fake"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"

import {
  executorForInstallation,
  handleDangerResults,
  runDangerAgainstFile,
  runDangerAgainstInstallation,
} from "../danger_runner"

import { readFileSync } from "fs"
import * as os from "os"
import { resolve } from "path"

const githubFixtures = resolve(__dirname, "..", "..", "github", "_tests", "fixtures")
const dangerfilesFixtures = resolve(__dirname, "fixtures")

const EOL = os.EOL

/** Returns JSON from the fixtured dir */
const requestWithFixturedJSON = async (path: string): Promise<() => Promise<any>> => () => (
  Promise.resolve(JSON.parse(readFileSync(`${githubFixtures}/${path}`, {}).toString()))
)

/** Returns arbitrary text value from a request */
const requestWithFixturedContent = async (path: string): Promise<() => Promise<string>> => () => (
  Promise.resolve(readFileSync(`${githubFixtures}/${path}`, {}).toString())
)

describe("evaling", () => {
  let api: GitHubAPI = {} as any

  beforeEach(async () => {
    // Move to
    // api = new GitHubAPI({ repoSlug: "artsy/emission", pullRequestID: "1" }, "ABCDE")
    // with next Danger release

    const fakeCI = new FakeCI({ DANGER_TEST_REPO: "artsy/emission", DANGER_TEST_PR: "1" })
    api = new GitHubAPI(fakeCI)

    api.getPullRequestInfo = await requestWithFixturedJSON("github_pr.json")
    api.getPullRequestDiff = await requestWithFixturedContent("github_diff.diff")
    api.getPullRequestCommits = await requestWithFixturedJSON("github_commits.json")
  })

  it("sets up an executor with the right repo/PR", () => {
      const executor = executorForInstallation(api)
      expect(executor.ciSource.repoSlug).toEqual("artsy/emission")
      expect(executor.ciSource.pullRequestID).toEqual("1")
  })

  it.skip("runs dangerfile with fixtured data", async () => {
      const executor = executorForInstallation(api)
      // The executor will return results etc in the next release
      const results = await runDangerAgainstFile(`${dangerfilesFixtures}/dangerfile_insecure.js`, executor)
      expect(results).toEqual({})
  })

  it("does not allow access to the `process` global")
})
