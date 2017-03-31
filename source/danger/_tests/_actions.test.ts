import { actionForRule, DangerRun, dsl } from "../actions"

const event = {
  name: "ping",
}

describe("for ping", () => {
  it("returns an action when ping is in the rules", () => {
    const rules = { ping: "dangerfile.js"}
    expect(actionForRule("ping", null, rules)).toEqual({
      action: null,
      dslType: dsl.pr,
      event: "",
    })
  })

  it("returns an action when ping is in the rules", () => {
    const rules = { }
    expect(actionForRule("ping", null, rules)).toBeNull()
  })
})

describe("for PRs", () => {
  it("returns an action when ping is in the rules", () => {
    const rules = { ping: "dangerfile.js"}
    expect(actionForRule("ping", null, rules)).toEqual({
      action: null,
      dslType: dsl.pr,
      event: "",
    })
  })
})
