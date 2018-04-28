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
import { createMockResponse } from "./create-mock-response"

jest.mock("../../db/getDB")
import { getDB } from "../../db/getDB"

const validRequest = { isXHub: true, isXHubValid: () => true, body: { installation: { id: 123 } } } as any
const noXhub = { isXHub: false } as any
const badXHub = { isXHub: true, isXHubValid: () => false } as any

describe("validating webhooks from GitHub", () => {
  it("fails when there is is no x-hub", () => {
    const res = createMockResponse()
    githubRouting("ping", noXhub, res, {} as any)
    expect(res.status).toBeCalledWith(400)
    expect(res.send).toBeCalledWith(
      "Request did not include x-hub header - You need to set a secret in the GitHub App + PERIL_WEBHOOK_SECRET."
    )
  })

  it("fails when there is is no x-hub", () => {
    const res = createMockResponse()

    githubRouting("ping", badXHub, res, {} as any)
    expect(res.status).toBeCalledWith(401)

    expect(res.send).toBeCalledWith(
      "Request did not have a valid x-hub header. Perhaps PERIL_WEBHOOK_SECRET is not set up right?"
    )
  })
})

describe("routing for GitHub", () => {
  it("calls ping when a ping action is sent", () => {
    githubRouting("ping", validRequest, {} as any, {} as any)
    expect(mockPing).toBeCalled()
  })

  it("creates an installation when an integration is created", () => {
    const body = { action: "created", installation: { account: { login: "Orta" } } }
    githubRouting("installation", { ...validRequest, body }, {} as any, {} as any)
    expect(mockCreateInstallation).toBeCalled()
  })

  it("deletes an installation when an integration is removed", () => {
    const body = { action: "deleted", installation: { id: 12345 } }
    githubRouting("installation", { ...validRequest, body }, {} as any, {} as any)

    expect(getDB().deleteInstallation).toBeCalledWith(12345)
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
