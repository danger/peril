jest.mock("../../../db/getDB", () => ({ default: { getRepo: () => Promise.resolve({ id: "123", fake: true }) } }))

const mockContents = jest.fn(() => Promise.resolve("// empty"))
const mockUserRepoAccess = jest.fn(() => Promise.resolve(true))
jest.mock("../../../github/lib/github_helpers", () => ({
  canUserWriteToRepo: mockUserRepoAccess,
  getGitHubFileContents: mockContents,
}))

const mockRunner = jest.fn(() => Promise.resolve("OK"))
jest.mock("../../../danger/danger_runner", () => ({ runDangerForInstallation: mockRunner }))

import { readFileSync } from "fs"
import { resolve } from "path"
import { DangerRun, dangerRunForRules } from "../../../danger/danger_run"
import { GitHubInstallation } from "../../../db"
import { GitHubRunSettings, runPRRun, setupForRequest } from "../github_runner"

const apiFixtures = resolve(__dirname, "fixtures")
const fixture = file => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("runs an Dangerfile for a PR with a local", async () => {
  mockContents.mockImplementationOnce(() => Promise.resolve("fail('dangerfile')"))
  mockContents.mockImplementationOnce(() => Promise.resolve("fail('dangerfile')"))

  const body = fixture("pull_request_opened.json")
  const settings = await setupForRequest({ body, headers: { "X-GitHub-Delivery": "12345" } } as any, {})

  const run = dangerRunForRules("pull_request", "opened", { pull_request: "dangerfile.pr" })[0]

  await runPRRun(run, settings, "token", body.pull_request)
  const call = mockRunner.mock.calls[0]

  expect(call[0]).toEqual("fail('dangerfile')")
  expect(call[1]).toEqual("dangerfile.pr")
})

describe("when someone edits the dangerfile", () => {
  beforeEach(() => {
    mockRunner.mockReset()
  })

  it("fails a run when a Dangerfile is edited by somone without access", async () => {
    mockContents.mockImplementationOnce(() => Promise.resolve("// safe"))
    mockContents.mockImplementationOnce(() => Promise.resolve("// unsafe"))
    mockUserRepoAccess.mockImplementationOnce(() => Promise.resolve(false))

    const body = fixture("pull_request_opened.json")
    const settings = await setupForRequest({ body, headers: { "X-GitHub-Delivery": "12345" } } as any, {})

    const run = dangerRunForRules("pull_request", "opened", { pull_request: "dangerfile.no.access.pr" })[0]

    const results = await runPRRun(run, settings, "token", body.pull_request)
    expect(mockRunner).not.toBeCalled()
    expect(results!.messages[0].message).toContain("Not running Danger rules")
  })

  it("runs a Dangerfile when edited by somone with access", async () => {
    mockContents.mockImplementationOnce(() => Promise.resolve("// safe"))
    mockContents.mockImplementationOnce(() => Promise.resolve("// unsafe"))
    mockUserRepoAccess.mockImplementationOnce(() => Promise.resolve(true))

    const body = fixture("pull_request_opened.json")
    const settings = await setupForRequest({ body, headers: { "X-GitHub-Delivery": "12345" } } as any, {})

    const run = dangerRunForRules("pull_request", "opened", { pull_request: "dangerfile.no.access.pr" })[0]

    const results = await runPRRun(run, settings, "token", body.pull_request)
    expect(mockRunner).toBeCalled()
  })
})
