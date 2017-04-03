const pingMock = jest.fn()
jest.mock("../../github/events/ping", () => { return { ping: pingMock }})

const createInstallationMock = jest.fn()
jest.mock("../../github/events/create_installation", () => { return { createInstallation: createInstallationMock }})

// const prMock = jest.fn()
// jest.mock("../../github/events/pull_request", () => { return { pullRequest: prMock }})

import { githubRouting } from "../router"

describe("routing for GitHub", () => {

  it("calls ping when a ping action is sent", () => {
    githubRouting("ping", {}, {})
    expect(pingMock).toBeCalled()
  })

  it("creates an installation when an integration is created", () => {
    const body = { action: "created" }
    githubRouting("integration_installation", { body }, {})
    expect(createInstallationMock).toBeCalled()
  })

  it.skip("does not creates an installation when an integration is updated is updated", () => {
    const body = { action: "updated" }
    githubRouting("integration_installation", { body }, {})
    expect(createInstallationMock).not.toBeCalled()
  })

  // it("creates an installation when an integration is created", () => {
  //   const body = {action: "Action", repository: {full_name: "OK"}}
  //   githubRouting("pull_request", { body }, {})
  //   expect(createInstallationMock).toBeCalled()
  // })
})
