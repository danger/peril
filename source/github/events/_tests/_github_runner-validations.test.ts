const mockDbInstallation = jest.fn()
const mockGetRepos = jest.fn()

jest.mock("../../../db/getDB", () => ({ default: { getInstallation: mockDbInstallation, getRepo: mockGetRepos } }))

import { readFileSync } from "fs"
import { resolve } from "path"
import { DangerRun, dangerRunForRules } from "../../../danger/danger_run"
import { GitHubInstallation, GithubRepo } from "../../../db"
import { GitHubInstallationSettings } from "../../../db/GitHubRepoSettings"
import { githubDangerRunner, GitHubRunSettings, runPRRun, setupForRequest } from "../github_runner"

const apiFixtures = resolve(__dirname, "fixtures")
const fixture = file => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("Does not run a dangerfile in an ignored repo", async () => {
  const body = fixture("pull_request_opened.json")
  const request = { body, headers: { "X-GitHub-Delivery": "12345" } } as any

  const installationSettings: GitHubInstallation = {
    id: 123,
    rules: {},
    settings: {
      env_vars: [],
      ignored_repos: [body.pull_request.head.repo.full_name],
      modules: [],
    },
  }

  const repo: GithubRepo = body.pull_request.head.repo
  mockGetRepos.mockImplementationOnce(() => repo)
  mockDbInstallation.mockImplementationOnce(() => installationSettings)

  const send = { send: jest.fn() }
  const response = { status: jest.fn(() => send) } as any

  await githubDangerRunner("pull_request_opened", request, response, () => "")

  expect(response.status).toHaveBeenCalledWith(200)
  expect(send.send).toHaveBeenCalledWith("Skipping peril run due to repo being in ignored")
})
