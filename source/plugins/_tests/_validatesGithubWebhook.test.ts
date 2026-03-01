import { createMockResponse } from "../../routing/_tests/create-mock-response"
import { validatesGithubWebhook } from "../validatesGithubWebhook"

const validRequest = { isXHub: true, isXHubValid: () => true, body: { installation: { id: 123 } } } as any
const noXhub = { isXHub: false } as any
const badXHub = { isXHub: true, isXHubValid: () => false } as any

describe("validating webhooks from GitHub", () => {
  it("fails when there is is no x-hub", () => {
    const res = createMockResponse()
    validatesGithubWebhook("pong", noXhub, res, {} as any)
    expect(res.status).toBeCalledWith(400)
    expect(res.send).toBeCalledWith(
      "Request did not include x-hub header - You need to set a secret in the GitHub App + PERIL_WEBHOOK_SECRET."
    )
  })

  it("fails when there is no x-hub", () => {
    const res = createMockResponse()

    validatesGithubWebhook("pong", badXHub, res, {} as any)
    expect(res.status).toBeCalledWith(401)

    expect(res.send).toBeCalledWith(
      "Request did not have a valid x-hub header. Perhaps PERIL_WEBHOOK_SECRET is not set up right?"
    )
  })

  it("passes when there is real creds", () => {
    const res = createMockResponse()
    const response = validatesGithubWebhook("pong", validRequest, res, {} as any)

    expect(response).toBeTruthy()
  })
})
