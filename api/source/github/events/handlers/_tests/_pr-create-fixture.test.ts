import { format } from "prettier"

jest.mock("../../../../db/getDB")
import { MockDB } from "../../../../db/__mocks__/getDB"
import { getDB } from "../../../../db/getDB"
const mockDB = getDB() as MockDB

jest.mock("../../../../runner/runFromSameHost")
import { runFromSameHost } from "../../../../runner/runFromSameHost"

jest.mock("../../../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("12345"),
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

import { PerilRunnerBootstrapJSON } from "../../../../runner/triggerSandboxRun"
import { setupForRequest } from "../../github_runner"

import { FakePlatform } from "danger/distribution/platforms/FakePlatform"
import { runPRRun } from "../pr"

const mockPlatform = new FakePlatform()
jest.mock("../../../../danger/peril_platform", () => ({
  getPerilPlatformForDSL: () => mockPlatform,
}))

jest.mock("../../createPRDSL", () => ({ createPRDSL: () => Promise.resolve({}) }))

const apiFixtures = resolve(__dirname, "../../_tests/fixtures")
const fixture = (file: string) => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))

it("passes the right args to the hyper functions when it's a PR", async () => {
  mockDB.getInstallation.mockReturnValue({ iID: "123", repos: {}, envVars: { hello: "world" } })

  const body = fixture("pull_request_opened.json")
  const req = { body, headers: { "X-GitHub-Delivery": "123" } } as any
  const settings = await setupForRequest(req, {})

  const dangerfileForRun = "warn(danger.github.api)"
  mockGetGitHubFileContents.mockImplementationOnce(() => Promise.resolve(dangerfileForRun))

  const runSettings = { pull_request: "danger/peril-settings@testing/logger.ts" }
  const run = dangerRunForRules("pull_request", "opened", runSettings, body)

  await runPRRun("eventName", run, settings, "12345", body.pull_request)

  // Take the payload, remove the JWT and save a copy of the JSON into a fixture dir, then snapshot it
  const payload = (runFromSameHost as any).mock.calls[0][0] as PerilRunnerBootstrapJSON
  payload.perilSettings.perilJWT = "12345"
  payload.perilSettings.perilRunID = "[run-id]"

  const file = format(JSON.stringify(payload, null, "  "), { parser: "json" })
  writeFileSync(__dirname + "/fixtures/PerilRunnerPRBootStrapExample.json", file, "utf8")

  expect(payload).toMatchSnapshot()
})
