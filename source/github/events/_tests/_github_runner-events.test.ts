const mockGetRepo = jest.fn()
jest.mock("../../../db/getDB", () => ({
  default: { getRepo: mockGetRepo },
}))

const mockGHContents = jest.fn((token, repo, path) => {
  if (path === "dangerfile.issue") {
    return Promise.resolve("warn('issue worked')")
  }
})

jest.mock("api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("token"),
}))
jest.mock("../../../github/lib/github_helpers", () => ({
  getGitHubFileContents: mockGHContents,
}))

import { readFileSync } from "fs"
import { resolve } from "path"
import { DangerRun, dangerRunForRules } from "../../../danger/danger_run"
import { GitHubInstallation } from "../../../db"
import { GitHubRunSettings, runEventRun, setupForRequest } from "../github_runner"

const apiFixtures = resolve(__dirname, "fixtures")
const fixture = file => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("runs an Dangerfile for an issue with a local", async () => {
  mockGetRepo.mockImplementationOnce(() => Promise.resolve({ id: "123", fake: true }))

  const body = fixture("issue_comment_created.json")
  const req = { body, headers: { "X-GitHub-Delivery": "123" } } as any

  const settings = await setupForRequest(req, {})
  expect(settings.commentableID).toBeTruthy()

  const run = dangerRunForRules("issue_comment", "created", {
    issue_comment: "dangerfile.issue",
  })[0]

  const result = await runEventRun(run, settings, "token", body)
  // See above in the mock for the link
  expect(result!.warnings[0].message).toEqual("issue worked")
})

it("adds github util functions and apis to the DSL for non-PR events", async () => {
  mockGetRepo.mockImplementationOnce(() => Promise.resolve({ id: "123", fake: true }))

  const body = fixture("issue_comment_created.json")
  const req = { body, headers: { "X-GitHub-Delivery": "123" } } as any
  const settings = await setupForRequest(req, {})

  const dangerfileForRun = "warn(danger.github.api)"
  mockGHContents.mockImplementationOnce(() => Promise.resolve(dangerfileForRun))
  const run = dangerRunForRules("issue_comment", "created", {
    issue_comment: "warn_with_api",
  })[0]

  const result = await runEventRun(run, settings, "token", body)
  expect(result!.warnings[0].message).not.toEqual("null")
})

it("can handle a db returning nil for the repo with an Dangerfile for an issue with a local", async () => {
  mockGetRepo.mockImplementationOnce(() => Promise.resolve(null))

  const body = fixture("issue_comment_created.json")
  const req = { body, headers: { "X-GitHub-Delivery": "123" } } as any
  const settings = await setupForRequest(req, {})
  expect(settings.commentableID).toBeTruthy()

  const run = dangerRunForRules("issue_comment", "created", {
    issue_comment: "dangerfile.issue",
  })[0]

  const result = await runEventRun(run, settings, "token", body)
  // See above i nthe mock for the link
  expect(result!.warnings[0].message).toEqual("issue worked")
})
