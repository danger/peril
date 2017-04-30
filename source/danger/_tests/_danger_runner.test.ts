import { FakeCI } from "danger/distribution/ci_source/providers/Fake"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { Platform } from "danger/distribution/platforms/platform"

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
  let platform: Platform = {} as any

  beforeEach(async () => {
    api = new GitHubAPI({ repoSlug: "artsy/emission", pullRequestID: "1" }, "ABCDE")
    platform = new GitHub(api)

    api.getPullRequestInfo = await requestWithFixturedJSON("github_pr.json")
    api.getPullRequestDiff = await requestWithFixturedContent("github_diff.diff")
    api.getPullRequestCommits = await requestWithFixturedJSON("github_commits.json")
    api.getReviewerRequests = await requestWithFixturedJSON("github_requested_reviewers.json")
    api.getReviews = await requestWithFixturedJSON("github_reviews.json")
    api.getIssue  = await requestWithFixturedJSON("github_issue.json")
  })

  it("runs a typescript dangerfile with fixtured data", async () => {
      const executor = executorForInstallation(platform)
      const results = await runDangerAgainstFile(`${dangerfilesFixtures}/dangerfile_empty.ts`, executor)
      expect(results).toEqual({
        fails: [], markdowns: [], messages: [], warnings: [{message: "OK"}],
      })
  })

  it("highlights some of the security measures", async () => {
      const executor = executorForInstallation(platform)
      const results = await runDangerAgainstFile(`${dangerfilesFixtures}/dangerfile_insecure.ts`, executor)
      expect(results.markdowns).toEqual([
        "`Object.keys(process.env).length` is 0",
      ])
  })

  // I wonder if the babel setup isn't quite right yet for this test
  it.skip("runs a JS dangerfile with fixtured data", async () => {
      const executor = executorForInstallation(platform)
      // The executor will return results etc in the next release
      const results = await runDangerAgainstFile(`${dangerfilesFixtures}/dangerfile_insecure.js`, executor)
      expect(results).toEqual({
        fails: [], markdowns: [], messages: [], warnings: [{message: "OK"}],
      })
  })

  it("does not allow access to the `process` global")
})
