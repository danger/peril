jest.mock("../../../db", () => ({ default: { getRepo: () => Promise.resolve({ fake: true }) } }))

import { readFileSync } from "fs"
import { resolve } from "path"
import { setupForRequest } from "../github_runner"

/** Returns JSON from the fixtured dir */
const requestWithFixturedJSON = (name: string): any => {
  const path = resolve(__dirname, "fixtures", `${name}.json`)
  return { body: JSON.parse(readFileSync(path, "utf8")), headers: { "X-GitHub-Delivery": "12345" } }
}

describe("makes the right settings for", () => {
  it("a pull_request_opened event", async () => {
    const pr = requestWithFixturedJSON("pull_request_opened")
    const settings = await setupForRequest(pr, {})

    expect(settings).toEqual({
      commentableID: 2,
      eventID: "12345",
      hasRelatedCommentable: true,
      installationSettings: {},
      isRepoEvent: true,
      isTriggeredByUser: true,
      repoName: "danger/peril",
      repoSpecificRules: {},
      triggeredByUsername: "orta",
    })
  })

  it("an integration_installation_created event", async () => {
    const pr = requestWithFixturedJSON("integration_installation_created")
    const settings = await setupForRequest(pr, {})

    expect(settings).toEqual({
      commentableID: null,
      eventID: "12345",
      hasRelatedCommentable: false,
      installationSettings: {},
      isRepoEvent: false,
      isTriggeredByUser: true,
      repoName: false,
      repoSpecificRules: {},
      triggeredByUsername: "orta",
    })
  })
})
