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
import { triggerSandboxDangerRun } from "../../../../runner/triggerSandboxRunFromExternalHost"
import { setupForRequest } from "../../github_runner"
import { runEventRun } from "../event"

jest.mock("../../../../runner/triggerSandboxRunFromExternalHost", () => ({
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

  await runEventRun("mockEvent", [run], settings, "token", body)
  const mock = (triggerSandboxDangerRun as any).mock.calls[0]

  expect(mock[1]).toMatchSnapshot("type")
  expect(mock[2]).toMatchSnapshot("installation")
  expect(mock[3]).toMatchSnapshot("paths")
  expect(mock[4]).toMatchSnapshot("payload")
})
