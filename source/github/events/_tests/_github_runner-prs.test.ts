const getRepoFake = () => Promise.resolve({ id: "123", fake: true })
jest.mock("../../../db", () => ({ default: { getRepo: getRepoFake } }))

let currentDangerfile = ""
const contentsMock = jest.fn(() => Promise.resolve(currentDangerfile))
jest.mock("../../../github/lib/github_helpers", () => ({ getGitHubFileContents: contentsMock }))

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
  currentDangerfile = "fail('dangerfile')"
  const body = fixture("pull_request_opened.json")
  const settings = await setupForRequest({ body } as any)

  const run = dangerRunForRules("pull_request", "opened", { pull_request: "dangerfile.pr" })!

  await runPRRun(run, settings, "token", body.pull_request)
  const call = runnerMock.mock.calls[0]

  expect(call[0]).toEqual("fail('dangerfile')")
  expect(call[1]).toEqual("dangerfile.pr")
})
