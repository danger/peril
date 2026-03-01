let mockGenda: any

class MockGenda {
  public define = jest.fn()
  public start = jest.fn()
  public every = jest.fn()

  constructor(public config: any) {
    mockGenda = this
  }

  public on(key: string, func: any) {
    if (key === "ready") {
      func()
    }
  }
}

jest.doMock("agenda", () => MockGenda)

import { startTaskScheduler } from "../startTaskScheduler"

it("it sets up correctly", async () => {
  await startTaskScheduler()

  // We have to get it started
  expect(mockGenda.start).toBeCalled()

  // And we need the right definitions
  const definitions = mockGenda.define.mock.calls.map((m: string[]) => m[0])
  expect(definitions).toMatchInlineSnapshot(`
Array [
  "runDangerfile",
  "hourly",
  "daily",
  "weekly",
  "monday-morning-est",
  "tuesday-morning-est",
  "wednesday-morning-est",
  "thursday-morning-est",
  "friday-morning-est",
]
`)

  // And we need to make sure all the time-y one
  const everys = mockGenda.every.mock.calls.map((m: string[]) => m[0])
  expect(everys).toMatchInlineSnapshot(`
Array [
  "1 hour",
  "1 day",
  "1 week",
  "0 0 9 * * 1",
  "0 0 9 * * 2",
  "0 0 9 * * 3",
  "0 0 9 * * 4",
  "0 0 9 * * 5",
]
`)
})
