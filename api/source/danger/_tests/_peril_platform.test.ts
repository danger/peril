import { RunType } from "../danger_run"

import { GitHub } from "danger/distribution/platforms/GitHub"
import { getPerilPlatformForDSL } from "../peril_platform"

it("Provides the Danger GitHub DSL for a PR", () => {
  const myAPI = {} as any
  const myEvent = { event: true }
  const platform = getPerilPlatformForDSL(RunType.pr, myAPI, myEvent)

  expect(platform).toBe(myAPI)
})

it("Uses the event json when it's a non-PR event", async () => {
  const gh = GitHub({
    getExternalAPI: () => ({ api: true }),
    fileContents: () => "",
  } as any)

  const myEvent = { event: true }

  const platform = getPerilPlatformForDSL(RunType.import, gh, myEvent)
  const platformDSL = await platform.getPlatformReviewDSLRepresentation()

  expect(platformDSL).toEqual({
    api: { api: true },
    event: true,
    utils: expect.anything(),
  })
})
