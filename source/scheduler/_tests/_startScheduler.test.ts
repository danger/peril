const mockSchedule = { scheduleJob: jest.fn() }
jest.mock("node-schedule", () => mockSchedule)

jest.mock("../../db/getDB", () => ({ default: { getInstallation: jest.fn() } }))
import db from "../../db/getDB"

const mockInstallation: jest.Mock<any> = db.getInstallation as any

import installationFactory from "../../testing/installationFactory"
import startScheduler from "../startScheduler"

it("runs scheduleJob for your tasks", async () => {
  const scheduler = {
    "1 2 3 4 5": "every_so_often.ts",
  }
  const installation = installationFactory({ scheduler })
  mockInstallation.mockImplementationOnce(() => Promise.resolve(installation))

  await startScheduler()

  expect(db.getInstallation).toBeCalledWith(0)
  expect(mockSchedule.scheduleJob).toBeCalledWith("1 2 3 4 5", expect.anything())
})
