const mockSchedule = { scheduleJob: jest.fn() }
jest.mock("node-schedule", () => mockSchedule)

jest.mock("../../db/getDB")
import { MockDB } from "../../db/__mocks__/getDB"
import { getDB } from "../../db/getDB"
const mockDB = getDB() as MockDB

import installationFactory from "../../testing/installationFactory"
import { runSchedule } from "../startScheduler"

it("runs scheduleJob for your tasks", async () => {
  const scheduler = {
    "1 2 3 4 5": "every_so_often.ts",
  }

  mockDB.getSchedulableInstallations.mockResolvedValueOnce([installationFactory({ scheduler })])

  await runSchedule()

  expect(mockSchedule.scheduleJob).toBeCalledWith("1 2 3 4 5", expect.anything())
})
