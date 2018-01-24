const mockRunDangerfileEnvironment = jest.fn()
jest.mock("danger/distribution/runner/runners/vm2", () => ({
  default: {
    createDangerfileRuntimeEnvironment: () => ({}),
    runDangerfileEnvironment: mockRunDangerfileEnvironment,
  },
}))

import fixturedGitHub from "../../api/_tests/fixtureAPI"
import {
  executorForInstallation,
  handleDangerResults,
  runDangerAgainstFile,
  runDangerForInstallation,
} from "../danger_runner"

import { dsl } from "../danger_run"

const defaultSettings = {
  env_vars: [],
  ignored_repos: [],
  modules: [],
}

const installationSettings = {
  id: 123,
  settings: defaultSettings,
}

jest.mock("../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("123"),
}))

describe("paths", () => {
  it("passes an absolute string to runDangerfileEnvironment", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    const results = await runDangerForInstallation(`dangerfile_empty.ts`, "", null, dsl.pr, installationSettings)

    const path = mockRunDangerfileEnvironment.mock.calls[0][0]
    expect(path.startsWith("/")).toBeTruthy()
  })
})
