import { actionForRule, DangerRun, dslTypeForEvent, dsl, dangerRepresentationforPath } from "../actions"

describe("for ping", () => {
  it("returns an action when ping is in the rules", () => {
    const rules = { ping: "dangerfile.js" }
    expect(actionForRule("ping", null, rules)).toEqual({
      action: null,
      dangerfilePath: "dangerfile.js",
      dslType: dsl.import,
      event: "ping",
    })
  })

  it("returns an action when ping is in the rules", () => {
    const rules = {}
    expect(actionForRule("ping", null, rules)).toBeNull()
  })
})

describe("for PRs", () => {
  it("returns a PR when PR is in the rules", () => {
    const rules = { pull_request: "dangerfile.js" }
    expect(actionForRule("pull_request", "created", rules)).toEqual({
      action: "created",
      dangerfilePath: "dangerfile.js",
      dslType: dsl.pr,
      event: "pull_request",
    })
  })

  // Same semantics
  it("returns a PR run when all sub events are globbed in the rules", () => {
    const rules = { "pull_request.*": "dangerfile.js" }
    expect(actionForRule("pull_request", "updated", rules)).toEqual({
      action: "updated",
      dangerfilePath: "dangerfile.js",
      dslType: dsl.pr,
      event: "pull_request",
    })
  })


  it("returns null when you only ask for a specific action", () => {
    const rules = { "pull_request.created": "dangerfile.js" }
    expect(actionForRule("pull_request", "updated", rules)).toBeNull()
  })

  it("returns a PR run when all sub events are globbed in the rules", () => {
    const rules = { "pull_request.deleted": "dangerfile.js" }
    expect(actionForRule("pull_request", "deleted", rules)).toEqual({
      action: "deleted",
      dangerfilePath: "dangerfile.js",
      dslType: dsl.pr,
      event: "pull_request",
    })
  })
})



describe("dangerRepresentationforPath", () => {
  it("returns just the path when there is no repo reference", () => {
    const path = "dangerfile.ts"
    expect(dangerRepresentationforPath(path)).toEqual({
      dangerfilePath: "dangerfile.ts",
    })
  })

  it("returns just the path when there is no repo reference", () => {
    const path = "orta/eigen@dangerfile.ts"
    expect(dangerRepresentationforPath(path)).toEqual({
      dangerfilePath: "dangerfile.ts",
      repoSlug: "orta/eigen",
    })
  })
})



describe("dslTypeForEvent", () => {
  it("recommends importing the integration as the DSL for anything but a PR", () => {
    expect(dslTypeForEvent("ping")).toEqual(dsl.import)
    expect(dslTypeForEvent("issue")).toEqual(dsl.import)
    expect(dslTypeForEvent("user")).toEqual(dsl.import)
  })

  it("recommends creating the Dangerfile DSL for a pull request", () => {
    expect(dslTypeForEvent("pull_request")).toEqual(dsl.pr)
  })
})

