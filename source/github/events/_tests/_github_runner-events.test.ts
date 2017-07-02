const getRepoFake = () => Promise.resolve({ id: "123", fake: true })

jest.mock("../../../db", () => ({ default: { getRepo: getRepoFake } }))

const contentsMock = jest.fn(() => Promise.resolve("warn('issue worked')"))
jest.mock("../../../github/lib/github_helpers", () => ({ getGitHubFileContents: contentsMock }))

import { readFileSync } from "fs"
import { resolve } from "path"
import { DangerRun, dangerRunForRules } from "../../../danger/danger_run"
import { GitHubInstallation } from "../../../db"
import { GitHubRunSettings, runEventRun, setupForRequest } from "../github_runner"

const apiFixtures = resolve(__dirname, "fixtures")
const fixture = file => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("runs a Dangerfile for an issue", async () => {
  const body = fixture("issue_comment_created.json")
  const req = { body } as any
  const settings = await setupForRequest(req)
  expect(settings.commentableID).toBeTruthy()

  const run = dangerRunForRules("issue_comment", "created", { issue_comment: "dangerfile.issue" })!

  const result = await runEventRun(run, settings, "token", body)

  expect(result!.warnings[0].message).toEqual("issue worked")
})
