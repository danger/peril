import { DangerDSLJSONType, PerilDSL } from "danger/distribution/dsl/DangerDSL"
import vm2 from "danger/distribution/runner/runners/vm2"

import { resolve } from "path"
import { fixturedAPI } from "../../api/_tests/fixtureAPI"
import { executorForInstallation, runDangerAgainstFileInline } from "../danger_runner"

const dangerfilesFixtures = resolve(__dirname, "fixtures")
const peril: PerilDSL = { env: {}, runTask: () => null }

const blankPayload = {
  dsl: {
    github: {
      issue: {
        id: 1,
      } as any,
    },
  } as DangerDSLJSONType,
  webhook: {},
}

jest.mock("../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("123"),
}))

const emptySettings = {
  env_vars: [],
  ignored_repos: [],
  modules: [],
}

const installationSettings = {
  iID: 123,
  settings: emptySettings,
}

// @ts-ignore
global.regeneratorRuntime = {}

describe("evaling an issue", () => {
  it("runs a typescript dangerfile with fixtured data", async () => {
    const platform = fixturedAPI()
    const executor = executorForInstallation(platform, vm2)
    const dangerfile = `
    warn("Issue number: " + danger.github.issue.id)
    `
    const results = await runDangerAgainstFileInline(
      `${dangerfilesFixtures}/dangerfile_issue.ts`,
      dangerfile,
      installationSettings,
      executor,
      peril,
      blankPayload
    )

    expect(results).toEqual({
      fails: [],
      markdowns: [],
      messages: [],
      warnings: [{ file: undefined, line: undefined, message: "Issue number: 1" }],
    })
  })
})
