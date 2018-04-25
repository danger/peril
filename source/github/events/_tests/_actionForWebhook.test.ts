import { actionForWebhook } from "../github_runner"

it("gets the action from a JSON payload", () => {
  expect(actionForWebhook({ action: "runs" })).toBe("runs")
})

it("gets the state from a JSON payload", () => {
  expect(actionForWebhook({ state: "runs" })).toBe("runs")
})

it("prioritises action from a JSON payload", () => {
  expect(actionForWebhook({ action: "pause", state: "runs" })).toBe("pause")
})

it("gives null otherwise", () => {
  expect(actionForWebhook({ deploy: "now" })).toBe(null)
})
