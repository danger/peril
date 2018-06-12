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

import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"
import { dangerRunForRules } from "../../../../danger/danger_run"
import { callHyperFunction } from "../../../../runner/hyper-api"
import { PerilRunnerBootstrapJSON } from "../../../../runner/triggerSandboxRun"
import { setupForRequest } from "../../github_runner"
import { runEventRun } from "../event"

jest.mock("../../../../runner/hyper-api", () => ({
  callHyperFunction: jest.fn(() => Promise.resolve('{ "CallId": 123 }')),
}))

const apiFixtures = resolve(__dirname, "../../_tests/fixtures")
const fixture = (file: string) => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("passes the right args to the hyper functions", async () => {
  mockDB.getInstallation.mockReturnValue({ iID: "123", repos: {}, envVars: { hello: "world" } })

  const body = fixture("issue_comment_created.json")
  const req = { body, headers: { "X-GitHub-Delivery": "123" } } as any
  const settings = await setupForRequest(req, {})

  const dangerfileForRun = "warn(danger.github.api)"
  mockGetGitHubFileContents.mockImplementationOnce(() => Promise.resolve(dangerfileForRun))

  const runSettings = { issue_comment: "org/repo@warn_with_api.ts#branch" }
  const run = dangerRunForRules("issue_comment", "created", runSettings, body)[0]

  await runEventRun("mockEvent", [run], settings, "token", body)

  // Take the payload, remove the JWT and save a copy of the JSON into a fixture dir, then snapshot it
  const payload = (callHyperFunction as any).mock.calls[0][0] as PerilRunnerBootstrapJSON
  payload.perilSettings.perilJWT = "[skipped]"
  payload.perilSettings.perilRunID = "[run-id]"
  writeFileSync(
    __dirname + "/fixtures/PerilRunnerEventBootStrapExample.json",
    JSON.stringify(payload, null, "  "),
    "utf8"
  )

  expect(payload).toMatchSnapshot()
})
