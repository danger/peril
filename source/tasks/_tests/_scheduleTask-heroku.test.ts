// import { generateTaskSchedulerForInstallation } from "../../tasks/scheduleTask"

jest.mock("../startTaskScheduler", () => ({
  agenda: { schedule: jest.fn() },
  runDangerfileTaskName: "mockTask",
}))

// import { agenda } from "../startTaskScheduler"

it("handles passing the task directly to agenda", () => {
  // const scheduleFunc = generateTaskSchedulerForInstallation(123, undefined)
  // scheduleFunc("My Task", "1 month", { hello: "world" })
  // expect(agenda.schedule).toBeCalledWith("1 month", "mockTask", {
  //   data: { hello: "world" },
  //   installationID: 123,
  //   taskName: "My Task",
  // })
})
