import { dsl } from "../danger_run"

import { GitHub } from "danger/distribution/platforms/GitHub"
import { getPerilPlatformForDSL } from "../peril_platform"

it("Provides the Danger GitHub DSL for a PR", () => {
  const myAPI = {} as any
  const myEvent = { event: true }
  const platform = getPerilPlatformForDSL(dsl.pr, myAPI, myEvent)

  expect(platform).toBe(myAPI)
})

it("Uses the event json when it's a non-PR event", async () => {
  const gh = new GitHub({
    getExternalAPI: () => ({ api: true }),
    fileContents: () => "",
  } as any)

  const myEvent = { event: true }

  const platform = getPerilPlatformForDSL(dsl.import, gh, myEvent)
  const platformDSL = await platform.getPlatformDSLRepresentation()

  expect(platformDSL).toEqual({
    api: { api: true },
    event: true,
    utils: expect.anything(),
  })
})
