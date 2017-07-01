const getRepoFake = () => Promise.resolve({ id: "123", fake: true })
jest.mock("../../../db", () => ({ default: { getRepo: getRepoFake } }))

const contentsMock = jest.fn(() => Promise.resolve("// empty"))
const userRepoAccessMock = jest.fn(() => Promise.resolve(true))
jest.mock("../../../github/lib/github_helpers", () => ({
  canUserWriteToRepo: userRepoAccessMock,
  getGitHubFileContents: contentsMock,
}))

const runnerMock = jest.fn(() => Promise.resolve("OK"))
jest.mock("../../../danger/danger_runner", () => ({ runDangerAgainstInstallation: runnerMock }))

import { readFileSync } from "fs"
import { resolve } from "path"
import { DangerRun, dangerRunForRules } from "../../../danger/danger_run"
import { GitHubInstallation } from "../../../db"
import { GitHubRunSettings, runPRRun, setupForRequest } from "../github_runner"

const apiFixtures = resolve(__dirname, "fixtures")
const fixture = file => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("runs an Dangerfile for a PR with a local", async () => {
  contentsMock.mockImplementationOnce(() => Promise.resolve("fail('dangerfile')"))
  contentsMock.mockImplementationOnce(() => Promise.resolve("fail('dangerfile')"))

  const body = fixture("pull_request_opened.json")
  const settings = await setupForRequest({ body } as any)

  const run = dangerRunForRules("pull_request", "opened", { pull_request: "dangerfile.pr" })!

  await runPRRun(run, settings, "token", body.pull_request)
  const call = runnerMock.mock.calls[0]

  expect(call[0]).toEqual("fail('dangerfile')")
  expect(call[1]).toEqual("dangerfile.pr")
})

describe("when someone edits the dangerfile", () => {
  beforeEach(() => {
    runnerMock.mockReset()
  })

  it("fails a run when a Dangerfile is edited by somone without access", async () => {
    contentsMock.mockImplementationOnce(() => Promise.resolve("// safe"))
    contentsMock.mockImplementationOnce(() => Promise.resolve("// unsafe"))
    userRepoAccessMock.mockImplementationOnce(() => Promise.resolve(false))

    const body = fixture("pull_request_opened.json")
    const settings = await setupForRequest({ body } as any)

    const run = dangerRunForRules("pull_request", "opened", { pull_request: "dangerfile.no.access.pr" })!

    const results = await runPRRun(run, settings, "token", body.pull_request)
    expect(runnerMock).not.toBeCalled()
    expect(results!.messages[0].message).toContain("Not running Danger rules")
  })

  it("runs a Dangerfile when edited by somone with access", async () => {
    contentsMock.mockImplementationOnce(() => Promise.resolve("// safe"))
    contentsMock.mockImplementationOnce(() => Promise.resolve("// unsafe"))
    userRepoAccessMock.mockImplementationOnce(() => Promise.resolve(true))

    const body = fixture("pull_request_opened.json")
    const settings = await setupForRequest({ body } as any)

    const run = dangerRunForRules("pull_request", "opened", { pull_request: "dangerfile.no.access.pr" })!

    const results = await runPRRun(run, settings, "token", body.pull_request)
    expect(runnerMock).toBeCalled()
  })
})
