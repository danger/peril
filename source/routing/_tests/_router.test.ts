const mockPing = jest.fn()
jest.mock("../../github/events/ping", () => ({ ping: mockPing }))

const mockCreateInstallation = jest.fn()
jest.mock("../../github/events/create_installation", () => ({
  createInstallation: mockCreateInstallation,
}))

const mockGithubRunner = jest.fn()
jest.mock("../../github/events/github_runner", () => ({
  githubDangerRunner: mockGithubRunner,
}))

import { githubRouting } from "../router"

const validRequest = { isXHub: true, isXHubValid: () => true, body: { installation: { id: 123 } } } as any
const noXhub = { isXHub: false } as any
const badXHub = { isXHub: true, isXHubValid: () => false } as any

describe("validating webhooks from GitHub", () => {
  let res: any

  beforeEach(() => {
    res = {}
    res.status = jest.fn(() => res)
    res.send = jest.fn()
  })

  it("fails when there is is no x-hub", () => {
    githubRouting("ping", noXhub, res, {} as any)
    expect(res.status).toBeCalledWith(400)
    expect(res.send).toBeCalledWith(
      "Request did not include x-hub header - You need to set a secret in the GitHub App + PERIL_WEBHOOK_SECRET."
    )
  })

  it("fails when there is is no x-hub", () => {
    githubRouting("ping", badXHub, res, {} as any)
    expect(res.status).toBeCalledWith(401)

    const message = res.send.mock.calls[0][0]
    expect(message).toContain("Request did not have a valid x-hub header")
  })
})

describe("routing for GitHub", () => {
  it("calls ping when a ping action is sent", () => {
    githubRouting("ping", validRequest, {} as any, {} as any)
    expect(mockPing).toBeCalled()
  })

  it("creates an installation when an integration is created", () => {
    const body = { action: "created" }
    githubRouting("installation", { ...validRequest, body }, {} as any, {} as any)
    expect(mockCreateInstallation).toBeCalled()
  })

  it("calls the GitHub runner for any other event", () => {
    githubRouting("issue", validRequest, {} as any, {} as any)
    expect(mockGithubRunner).toBeCalledWith("issue", validRequest, {}, {})

    githubRouting("new_user", validRequest, {} as any, {} as any)
    expect(mockGithubRunner).toBeCalledWith("new_user", validRequest, {}, {})

    githubRouting("random_thing", validRequest, {} as any, {} as any)
    expect(mockGithubRunner).toBeCalledWith("random_thing", validRequest, {}, {})
  })
})
