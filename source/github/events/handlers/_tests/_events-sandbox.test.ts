jest.mock("../../../../db/getDB")
import { MockDB } from "../../../../db/__mocks__/getDB"
import { getDB } from "../../../../db/getDB"
const mockDB = getDB() as MockDB

jest.mock("../../../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("token"),
}))

jest.mock("../../../../github/lib/github_helpers", () => ({
  getGitHubFileContents: jest.fn(),
}))
import { getGitHubFileContents } from "../../../lib/github_helpers"
const mockGetGitHubFileContents: any = getGitHubFileContents

import { readFileSync } from "fs"
import { resolve } from "path"
import { dangerRunForRules } from "../../../../danger/danger_run"
import { triggerSandboxDangerRun } from "../../../../runner/triggerSandboxRun"
import { setupForRequest } from "../../github_runner"
import { runEventRun } from "../event"

jest.mock("../../../../runner/triggerSandboxRun", () => ({
  triggerSandboxDangerRun: jest.fn(),
}))

const apiFixtures = resolve(__dirname, "../../_tests/fixtures")
const fixture = (file: string) => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("sets up the right call to trigger sandbox run", async () => {
  mockDB.getInstallation.mockReturnValueOnce({ iID: "123", repos: {} })

  const body = fixture("issue_comment_created.json")
  const req = { body, headers: { "X-GitHub-Delivery": "123" } } as any
  const settings = await setupForRequest(req, {})

  const dangerfileForRun = "warn(danger.github.api)"
  mockGetGitHubFileContents.mockImplementationOnce(() => Promise.resolve(dangerfileForRun))

  const run = dangerRunForRules("issue_comment", "created", { issue_comment: "warn_with_api" }, body)[0]

  await runEventRun([run], settings, "token", body)
  const mock = (triggerSandboxDangerRun as any).mock.calls

  expect(mock[0][0]).toMatchSnapshot("type")
  expect(mock[0][1]).toMatchSnapshot("installation")
  expect(mock[0][2]).toMatchSnapshot("paths")
  expect(mock[0][3]).toMatchSnapshot("payload")
  expect(mock[0][4]).toMatchSnapshot("peril")
})

it.only("passes the env vars from the installation into the peril object", async () => {
  // this is what should be inside the peril obj
  const envVars = { doggo: true }

  mockDB.getInstallation.mockReturnValue({ iID: "123", repos: {}, envVars })

  const body = fixture("issue_comment_created.json")
  const req = { body, headers: { "X-GitHub-Delivery": "123" } } as any
  const settings = await setupForRequest(req, {})

  const dangerfileForRun = "warn(danger.github.api)"
  mockGetGitHubFileContents.mockImplementationOnce(() => Promise.resolve(dangerfileForRun))

  const run = dangerRunForRules("issue_comment", "created", { issue_comment: "warn_with_api" }, body)[0]

  await runEventRun([run], settings, "token", body)
  const mock = (triggerSandboxDangerRun as any).mock.calls

  // Extract the peril obj from the call to triggerSandboxDangerRun
  expect(mock[0][4]).toEqual({ env: envVars, runTask: expect.anything() })
})
