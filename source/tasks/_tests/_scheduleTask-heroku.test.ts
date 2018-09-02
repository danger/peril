import { generateTaskSchedulerForInstallation } from "../../tasks/scheduleTask"
import { triggerAFutureDangerRun } from "../startTaskScheduler"

jest.mock("../startTaskScheduler", () => ({
  agenda: { schedule: jest.fn() },
  runDangerfileTaskName: "mockTask",
  hasAgendaInRuntime: () => true,
  triggerAFutureDangerRun: jest.fn(),
}))

it("handles passing the task directly to agenda", () => {
  const scheduleFunc = generateTaskSchedulerForInstallation(123, undefined)
  scheduleFunc("My Task", "in 1 day", { hello: "world" })
  expect(triggerAFutureDangerRun).toBeCalledWith("1 day", {
    data: { hello: "world" },
    installationID: 123,
    taskName: "My Task",
  })
})
