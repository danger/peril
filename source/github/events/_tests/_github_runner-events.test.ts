const mockGetRepo = jest.fn()

jest.mock("../../../db/getDB", () => ({
  getDB: () => ({
    getInstallation: () => Promise.resolve({ repos: mockGetRepo }),
  }),
}))

const mockGHContents = jest.fn((_, __, path) => {
  if (path === "dangerfile.issue") {
    return Promise.resolve("warn('issue worked')")
  }
  return ""
})

jest.mock("../../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("token"),
}))

jest.mock("../../../github/lib/github_helpers", () => ({
  getGitHubFileContents: mockGHContents,
}))

// @ts-ignore
global.regeneratorRuntime = {}

import { readFileSync } from "fs"
import { resolve } from "path"
import { dangerRunForRules } from "../../../danger/danger_run"
import { setupForRequest } from "../github_runner"
import { runEventRun } from "../handlers/event"

const apiFixtures = resolve(__dirname, "fixtures")
const fixture = (file: string) => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("runs an Dangerfile for an issue with a local", async () => {
  mockGetRepo.mockImplementationOnce(() => ({ id: "123", fake: true }))

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
  mockGetRepo.mockImplementationOnce(() => ({ id: "123", fake: true }))

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

it("adds github util functions and apis to the DSL for non-PR events", async () => {
  mockGetRepo.mockImplementationOnce(() => ({ id: "123", fake: true }))

  const body = fixture("issue_comment_created.json")
  const req = { body, headers: { "X-GitHub-Delivery": "123" } } as any
  const settings = await setupForRequest(req, {})

  // Pass in the installation ID to warn
  const dangerfileForRun = "module.exports.default = (deets) => { warn(deets.installation.id) }"
  mockGHContents.mockImplementationOnce(() => Promise.resolve(dangerfileForRun))
  const run = dangerRunForRules("issue_comment", "created", {
    issue_comment: "warn_with_api",
  })[0]

  const result = await runEventRun(run, settings, "token", body)
  expect(result!.warnings[0].message).toEqual(23511)
})

it("can handle a db returning nil for the repo with an Dangerfile for an issue with a local", async () => {
  mockGetRepo.mockImplementationOnce(() => null)

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
