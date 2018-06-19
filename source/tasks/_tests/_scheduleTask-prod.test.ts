import { generateTaskSchedulerForInstallation } from "../../tasks/scheduleTask"

jest.mock("../startTaskScheduler", () => ({
  agenda: undefined,
  runDangerfileTaskName: "mockTask",
}))

jest.mock("../../api/fetch", () => ({
  fetch: jest.fn(() => Promise.resolve()),
}))

import { fetch } from "../../api/fetch"
import { gql } from "../../api/graphql/gql"
import { PerilRunnerBootstrapJSON } from "../../runner/triggerSandboxRun"

it("handles making a working graphql mutation", () => {
  const bootstrap: any = {
    perilSettings: {
      perilJWT: "123.asd.zxc",
      perilAPIRoot: "https://murphdog.com",
    },
  } as Partial<PerilRunnerBootstrapJSON>

  const scheduleFunc = generateTaskSchedulerForInstallation(123, bootstrap)
  scheduleFunc("My Task", "1 month", JSON.stringify({ hello: "world" }))

  expect(fetch).toBeCalledWith("https://murphdog.com/api/graphql", {
    body: expect.anything(),
    headers: expect.anything(),
    method: "POST",
  })

  // Verify the query feels right
  const mockFetch = fetch as any
  const body = mockFetch.mock.calls[0][1].body
  const response = JSON.parse(body)

  expect(response.query.replace(/\s/g, "").replace(/\\/g, "")).toEqual(
    gql`
      mutation {
        scheduleTask(jwt: "123.asd.zxc", task: "My Task", time: "1 month", data: "{ \"hello\": \"world\" }") {
          success
        }
      }
    `
      .replace(/\s/g, "")
      .replace(/\\/g, "")
  )
})
