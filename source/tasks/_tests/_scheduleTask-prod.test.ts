import { generateTaskSchedulerForInstallation } from "../../tasks/scheduleTask"

jest.mock("../startTaskScheduler", () => ({
  agenda: undefined,
  runDangerfileTaskName: "mockTask",
}))

jest.mock("../../api/fetch", () => ({
  fetch: jest.fn(() => Promise.resolve()),
}))

import { fetch } from "../../api/fetch"
import { PerilRunnerBootstrapJSON } from "../../runner/triggerSandboxRun"

it("handles making a working graphql mutation", () => {
  const bootstrap: any = {
    perilSettings: {
      perilJWT: "123.asd.zxc",
      perilAPIRoot: "https://murphdog.com",
    },
  } as Partial<PerilRunnerBootstrapJSON>

  const scheduleFunc = generateTaskSchedulerForInstallation(123, bootstrap)
  scheduleFunc("My Task", "1 month", { hello: "world" })

  expect(fetch).toBeCalledWith("https://murphdog.com/api/graphql", {
    body:
      '{"query":"mutation {\\n        scheduleTask(\\n          { jwt: \\"123.asd.zxc\\", task: \\"mockTask\\", time: \\"1 month\\", data: { hello: \\"world\\" } }\\n        ) {\\n          success\\n        }\\n      }"}',
    method: "POST",
  })
})
