const mockRunDangerfileEnvironment = jest.fn()
jest.mock("danger/distribution/runner/DangerfileRunner", () => ({
  createDangerfileRuntimeEnvironment: () => ({}),
  runDangerfileEnvironment: mockRunDangerfileEnvironment,
}))

import { FakeCI } from "danger/distribution/ci_source/providers/Fake"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { Platform } from "danger/distribution/platforms/platform"

import fixturedGitHub from "../../api/_tests/fixtureAPI"
import {
  executorForInstallation,
  handleDangerResults,
  runDangerAgainstFile,
  runDangerForInstallation,
} from "../danger_runner"

import { existsSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { basename, resolve } from "path"
import { dsl } from "../danger_run"

const dangerfilesFixtures = resolve(__dirname, "fixtures")

const defaultSettings = {
  env_vars: [],
  ignored_repos: [],
  modules: [],
}

const installationSettings = {
  id: 123,
  settings: defaultSettings,
}

jest.mock("../../api/github.ts", () => ({ getTemporaryAccessTokenForInstallation: () => Promise.resolve("123") }))

describe("paths", () => {
  it("passes an absolute string to runDangerfileEnvironment", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    const results = await runDangerForInstallation(`dangerfile_empty.ts`, "", null, dsl.pr, installationSettings)

    const firstArgCalled = mockRunDangerfileEnvironment.mock.calls[0][0]
    expect(firstArgCalled).toContain("/peril/")
  })
})
