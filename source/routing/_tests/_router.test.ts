const pingMock = jest.fn()
jest.mock("../../github/events/ping", () =>  ({ ping: pingMock }))

const createInstallationMock = jest.fn()
jest.mock("../../github/events/create_installation", () => ({ createInstallation: createInstallationMock }))

const githubRunnerMock = jest.fn()
jest.mock("../../github/events/github_runner", () => ({ githubDangerRunner: githubRunnerMock }))

import { githubRouting } from "../router"

describe("routing for GitHub", () => {

  it("calls ping when a ping action is sent", () => {
    githubRouting("ping", {}, {}, {})
    expect(pingMock).toBeCalled()
  })

  it("creates an installation when an integration is created", () => {
    const body = { action: "created" }
    githubRouting("integration_installation", { body }, {}, {})
    expect(createInstallationMock).toBeCalled()
  })

  it("calls the GitHub runner for any other event", () => {
    githubRouting("issue", {}, {}, {})
    expect(githubRunnerMock).toBeCalledWith("issue", {}, {}, {})

    githubRouting("new_user", {}, {}, {})
    expect(githubRunnerMock).toBeCalledWith("new_user", {}, {}, {})

    githubRouting("random_thing", {}, {}, {})
    expect(githubRunnerMock).toBeCalledWith("random_thing", {}, {}, {})
  })
})
