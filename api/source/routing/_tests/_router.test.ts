const mockGithubRunner = jest.fn()
jest.mock("../../github/events/github_runner", () => ({
  githubDangerRunner: mockGithubRunner,
}))

jest.mock("../../plugins/installationSettingsUpdater", () => ({
  installationSettingsUpdater: jest.fn(),
}))

jest.mock("../../plugins/recordWebhooks", () => ({
  recordWebhook: jest.fn(),
}))

import { installationSettingsUpdater } from "../../plugins/installationSettingsUpdater"
import { recordWebhook } from "../../plugins/recordWebhooks"
import { githubRouter } from "../router"

const validRequestWithEvent = (header: string) =>
  ({ isXHub: true, isXHubValid: () => true, body: { installation: { id: 123 } }, header: () => header } as any)

it("calls the GitHub runner for any events", () => {
  const req = validRequestWithEvent("issue")
  githubRouter(req, {} as any, {} as any)
  expect(mockGithubRunner).toBeCalledWith("issue", req, {}, {})
})

it("calls plugins", () => {
  const req = validRequestWithEvent("push")
  githubRouter(req, {} as any, {} as any)

  expect(mockGithubRunner).toBeCalledWith("push", req, {}, {})
  expect(installationSettingsUpdater).toBeCalled()
  expect(recordWebhook).toBeCalled()
})
