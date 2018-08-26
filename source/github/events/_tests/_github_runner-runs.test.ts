import { generateInstallation } from "../../../testing/installationFactory"
import { GitHubRunSettings, runsForEvent } from "../github_runner"

// Default settings
const defaultRun: GitHubRunSettings = {
  commentableID: 2,
  eventID: "09876",
  hasRelatedCommentable: true,
  installationID: 123,
  installationSettings: {
    env_vars: [],
    ignored_repos: [],
    modules: [],
  },
  isRepoEvent: true,
  isTriggeredByUser: true,
  repoName: "danger/peril",
  repoSpecificRules: {
    pull_request: "pr.ts",
  },
  triggeredByUsername: "orta",
}

const defaultSettings = {
  env_vars: [],
  ignored_repos: [],
  modules: [],
}

// A function to override defaults
const getSettings = (overwrites: Partial<GitHubRunSettings>) => ({
  ...defaultRun,
  ...overwrites,
})

it("handles a platform only run", () => {
  const installation = generateInstallation({
    iID: 12,
    rules: {
      pull_request: "orta/peril-dangerfiles@pr.ts",
    },
    settings: defaultSettings,
  })

  const settings = getSettings({ repoSpecificRules: {} })

  const runs = runsForEvent("pull_request", "created", installation, {}, settings)
  expect(runs).toEqual([
    {
      action: "created",
      branch: "master",
      dangerfilePath: "pr.ts",
      dslType: 0,
      event: "pull_request",
      feedback: 0,
      repoSlug: "orta/peril-dangerfiles",
      referenceString: "orta/peril-dangerfiles@pr.ts",
    },
  ])
})

it("Gets the right paths from both installation wide, and per repo rules", () => {
  const installation = generateInstallation({
    iID: 12,
    rules: {
      "pull_request.labeled": "orta/peril-dangerfiles/org@pr.ts",
    },
    settings: defaultSettings,
  })

  const settings = getSettings({ repoSpecificRules: { "pull_request.labeled": "orta/peril-dangerfiles/local@pr.ts" } })

  const runs = runsForEvent("pull_request", "labeled", installation, {}, settings)
  expect(runs.map(r => r.referenceString)).toEqual([
    "orta/peril-dangerfiles/org@pr.ts",
    "orta/peril-dangerfiles/local@pr.ts",
  ])
})

it("gets the expected runs for platform + repo rules", () => {
  const installation = generateInstallation({
    iID: 12,
    rules: {
      pull_request: "orta/peril-dangerfiles@pr.ts",
    },
    settings: defaultSettings,
  })

  const settings = getSettings({})

  const runs = runsForEvent("pull_request", "created", installation, {}, settings)
  expect(runs).toEqual([
    {
      action: "created",
      branch: "master",
      dangerfilePath: "pr.ts",
      dslType: 0,
      event: "pull_request",
      feedback: 0,
      repoSlug: "orta/peril-dangerfiles",
      referenceString: "orta/peril-dangerfiles@pr.ts",
    },
    {
      action: "created",
      branch: "master",
      dangerfilePath: "pr.ts",
      dslType: 0,
      event: "pull_request",
      feedback: 0,
      repoSlug: undefined,
      referenceString: "pr.ts",
    },
  ])
})

it("gets the expected runs for platform", () => {
  const installation = generateInstallation({
    iID: 12,
    rules: {
      pull_request: "orta/peril-dangerfiles@pr.ts",
    },
    settings: defaultSettings,
  })

  const repo = {
    fullName: "danger/peril",
    id: 1,
    installationID: 12,
    rules: {
      issues: "pr.ts",
    },
  }

  const settings = getSettings({
    repoSpecificRules: repo.rules,
    repoName: repo.fullName,
  })

  const runs = runsForEvent("issues", "created", installation, {}, settings)
  expect(runs).toEqual([
    {
      action: "created",
      branch: "master",
      dangerfilePath: "pr.ts",
      dslType: 1,
      event: "issues",
      feedback: 0,
      referenceString: "pr.ts",
      repoSlug: undefined,
    },
  ])
})
