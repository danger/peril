const mockSchedule = { scheduleJob: jest.fn() }
jest.mock("node-schedule", () => mockSchedule)

const mockInstallation: jest.Mock<any> = jest.fn()
jest.mock("../../db/getDB", () => ({
  getDB: () => ({ getInstallation: mockInstallation }),
}))
import { getDB } from "../../db/getDB"

import installationFactory from "../../testing/installationFactory"
import startScheduler from "../startScheduler"

it("runs scheduleJob for your tasks", async () => {
  const scheduler = {
    "1 2 3 4 5": "every_so_often.ts",
  }
  const installation = installationFactory({ scheduler })
  mockInstallation.mockImplementationOnce(() => Promise.resolve(installation))

  await startScheduler()

  expect(getDB().getInstallation).toBeCalledWith(0)
  expect(mockSchedule.scheduleJob).toBeCalledWith("1 2 3 4 5", expect.anything())
})
