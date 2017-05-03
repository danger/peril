
import { dsl } from "../danger_run"

import getPerilPlatformForDSL from "../peril_platform"

it("Provides the Danger GitHub DSL for a PR", () => {
  const myAPI = {} as any
  const myEvent = { event: true }
  const platform = getPerilPlatformForDSL(dsl.pr, myAPI, myEvent)

  expect(platform).toBe(myAPI)
})

it("Uses the event json when it's not a PR",  async () => {
  const myAPI = {} as any
  const myEvent = { event: true }

  const platform = getPerilPlatformForDSL(dsl.import, myAPI, myEvent)
  const platformDSL = await platform.getPlatformDSLRepresentation()

  expect(platformDSL).toEqual({ event: true})
})
