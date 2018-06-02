jest.mock("../../../../db/getDB")
import { MockDB } from "../../../../db/__mocks__/getDB"
import { getDB } from "../../../../db/getDB"
const mockDB = getDB() as MockDB

jest.mock("../../../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("token"),
}))

jest.mock("../../../../github/lib/github_helpers", () => ({
  getGitHubFileContents: jest.fn(),
  canUserWriteToRepo: () => true,
}))
import { getGitHubFileContents } from "../../../lib/github_helpers"
const mockGetGitHubFileContents: any = getGitHubFileContents

import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"
import { dangerRunForRules } from "../../../../danger/danger_run"
import { callHyperFunction } from "../../../../runner/hyper-api"
import { PerilRunnerBootstrapJSON } from "../../../../runner/triggerSandboxRun"
import { setupForRequest } from "../../github_runner"

import { runPRRun } from "../pr"

jest.mock("../../../../runner/hyper-api", () => ({
  callHyperFunction: jest.fn(() => Promise.resolve('{ "CallId": 123 }')),
}))

import { FakePlatform } from "danger/distribution/platforms/FakePlatform"

const mockPlatform = new FakePlatform()
jest.mock("../../../../danger/peril_platform", () => ({
  getPerilPlatformForDSL: () => mockPlatform,
}))

const apiFixtures = resolve(__dirname, "../../_tests/fixtures")
const fixture = (file: string) => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("passes the right args to the hyper functions when it's a PR", async () => {
  mockDB.getInstallation.mockReturnValue({ iID: "123", repos: {}, envVars: { hello: "world" } })

  const body = fixture("pull_request_opened.json")
  const req = { body, headers: { "X-GitHub-Delivery": "123" } } as any
  const settings = await setupForRequest(req, {})

  const dangerfileForRun = "warn(danger.github.api)"
  mockGetGitHubFileContents.mockImplementationOnce(() => Promise.resolve(dangerfileForRun))

  const runSettings = { pull_request: "org/repo@warn_with_api.ts#branch" }
  const run = dangerRunForRules("pull_request", "created", runSettings, body)

  await runPRRun(run, settings, "token", body.pull_request)

  // Take the payload, remove the JWT and save a copy of the JSON into a fixture dir, then snapshot it
  const payload = (callHyperFunction as any).mock.calls[0][0] as PerilRunnerBootstrapJSON
  payload.perilSettings.perilJWT = "[skipped]"
  payload.perilSettings.perilRunID = "[run-id]"
  writeFileSync(__dirname + "/fixtures/PerilRunnerPRBootStrapExample.json", JSON.stringify(payload, null, "  "), "utf8")

  expect(payload).toMatchSnapshot()
})
