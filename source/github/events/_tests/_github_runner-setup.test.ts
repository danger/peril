jest.mock("../../../db", () => ({ default: { getRepo: () => Promise.resolve({ fake: true }) } }))

import { readFileSync } from "fs"
import { resolve } from "path"
import { setupForRequest } from "../github_runner"

/** Returns JSON from the fixtured dir */
const requestWithFixturedJSON = (name: string): any => {
  const path = resolve(__dirname, "fixtures", `${name}.json`)
  return { body: JSON.parse(readFileSync(path, "utf8")) }
}

describe("makes the right settings for", () => {
  it("a pull_request_opened event", async () => {
    const pr = requestWithFixturedJSON("pull_request_opened")
    const settings = await setupForRequest(pr)

    expect(settings).toEqual({
      commentableID: 2,
      hasRelatedCommentable: true,
      isRepoEvent: true,
      isTriggeredByUser: true,
      repo: { fake: true },
      repoName: "danger/peril",
      triggeredByUsername: "orta",
    })
  })

  it("an integration_installation_created event", async () => {
    const pr = requestWithFixturedJSON("integration_installation_created")
    const settings = await setupForRequest(pr)

    expect(settings).toEqual({
      commentableID: null,
      hasRelatedCommentable: false,
      isRepoEvent: false,
      isTriggeredByUser: true,
      repo: null,
      repoName: false,
      triggeredByUsername: "orta",
    })
  })
})
