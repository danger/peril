import { GitHubInstallation } from "../../../db"
import { GitHubRunSettings, runsForEvent } from "../github_runner"

// Default settings
const defaultRun: GitHubRunSettings = {
  commentableID: 2,
  eventID: "09876",
  hasRelatedCommentable: true,
  installationSettings: {},
  isRepoEvent: true,
  isTriggeredByUser: true,
  repoName: "danger/peril",
  repoSpecificRules: {
    pull_request: "pr.ts",
  },
  triggeredByUsername: "orta",
}

// A function to override defaults
const getSettings = (overwrites: Partial<GitHubRunSettings>) => ({
  ...defaultRun,
  ...overwrites,
})

it("handles a platform only run", () => {
  const installation = {
    id: 12,
    rules: {
      pull_request: "orta/peril-dangerfiles@pr.ts",
    },
    settings: {},
  }

  const settings = getSettings({ repoSpecificRules: {} })

  const runs = runsForEvent("pull_request", "created", installation, settings)
  expect(runs).toEqual([
    {
      action: "created",
      dangerfilePath: "pr.ts",
      dslType: 0,
      event: "pull_request",
      feedback: 0,
      repoSlug: "orta/peril-dangerfiles",
    },
  ])
})

it("gets the expected runs for platform + repo rules", () => {
  const installation: GitHubInstallation = {
    id: 12,
    rules: {
      pull_request: "orta/peril-dangerfiles@pr.ts",
    },
    settings: {},
  }

  const settings = getSettings({})

  const runs = runsForEvent("pull_request", "created", installation, settings)
  expect(runs).toEqual([
    {
      action: "created",
      dangerfilePath: "pr.ts",
      dslType: 0,
      event: "pull_request",
      feedback: 0,
      repoSlug: "orta/peril-dangerfiles",
    },
    {
      action: "created",
      dangerfilePath: "pr.ts",
      dslType: 0,
      event: "pull_request",
      feedback: 0,
    },
  ])
})

it("gets the expected runs for platform", () => {
  const installation = {
    id: 12,
    rules: {
      pull_request: "orta/peril-dangerfiles@pr.ts",
    },
    settings: {},
  }

  const repo = {
    fullName: "danger/peril",
    id: 1,
    installationID: 12,
    rules: {
      issues: "pr.ts",
    },
  }

  const settings = getSettings({ repoSpecificRules: repo.rules, repoName: repo.fullName })

  const runs = runsForEvent("issues", "created", installation, settings)
  expect(runs).toEqual([
    {
      action: "created",
      dangerfilePath: "pr.ts",
      dslType: 1,
      event: "issues",
      feedback: 0,
    },
  ])
})
