import { GitHub, GitHubType } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"

import { readFileSync } from "fs"

import { resolve } from "path"

const githubFixtures = resolve(__dirname, "..", "..", "github", "_tests", "fixtures")

/** Returns JSON from the fixtured dir */
const requestWithFixturedJSON = (path: string): (() => Promise<any>) => () =>
  Promise.resolve(JSON.parse(readFileSync(`${githubFixtures}/${path}`, {}).toString()))

/** Returns arbitrary text value from a request */
const requestWithFixturedContent = (path: string): (() => Promise<string>) => () =>
  Promise.resolve(readFileSync(`${githubFixtures}/${path}`, {}).toString())

/** Returns a fixtured GitHub instance */

export const fixturedAPI = (repoSlug?: string, pullRequestID?: string): GitHubType => {
  repoSlug = repoSlug || "artsy/emission"
  pullRequestID = pullRequestID || "1"
  const api = new GitHubAPI({ repoSlug, pullRequestID }, "ABCDE")
  const platform = GitHub(api)

  api.getPullRequestInfo = requestWithFixturedJSON("github_pr.json")
  api.getPullRequestDiff = requestWithFixturedContent("github_diff.diff")
  api.getPullRequestCommits = requestWithFixturedJSON("github_commits.json")
  api.getReviewerRequests = requestWithFixturedJSON("github_requested_reviewers.json")
  api.getReviews = requestWithFixturedJSON("github_reviews.json")
  api.getIssue = requestWithFixturedJSON("github_issue.json")

  return platform
}
