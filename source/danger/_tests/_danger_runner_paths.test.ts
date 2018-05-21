const mockRunDangerfileEnvironment = jest.fn()
jest.mock("danger/distribution/runner/runners/vm2", () => ({
  default: {
    createDangerfileRuntimeEnvironment: () => ({}),
    runDangerfileEnvironment: mockRunDangerfileEnvironment,
  },
}))

import { DangerDSLJSONType } from "danger/distribution/dsl/DangerDSL"
import { RunType } from "../danger_run"
import { runDangerForInstallation } from "../danger_runner"

const defaultSettings = {
  env_vars: [],
  ignored_repos: [],
  modules: [],
}

const installationSettings = {
  iID: 123,
  settings: defaultSettings,
}

const blankPayload = { dsl: {} as DangerDSLJSONType, webhook: {} }

jest.mock("../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("123"),
}))

describe("paths", () => {
  it("passes an absolute string to runDangerfileEnvironment", async () => {
    await runDangerForInstallation([`dangerfile_empty.ts`], [""], null, RunType.pr, installationSettings, blankPayload)

    const paths = mockRunDangerfileEnvironment.mock.calls[0][0]
    expect(paths[0].startsWith("/")).toBeTruthy()
  })
})
