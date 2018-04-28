const mockGithubRunner = jest.fn()
jest.mock("../../github/events/github_runner", () => ({
  githubDangerRunner: mockGithubRunner,
}))

import { githubRouter } from "../router"

const validRequestWithEvent = (header: string) =>
  ({ isXHub: true, isXHubValid: () => true, body: { installation: { id: 123 } }, header: () => header } as any)

it("calls the GitHub runner for any events", () => {
  const req = validRequestWithEvent("issue")
  githubRouter(req, {} as any, {} as any)
  expect(mockGithubRunner).toBeCalledWith("issue", req, {}, {})
})
