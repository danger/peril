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
  runDangerAgainstInstallation,
} from "../danger_runner"

import { existsSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { basename, resolve } from "path"
import { dsl } from "../danger_run"

const dangerfilesFixtures = resolve(__dirname, "fixtures")

describe("paths", () => {
  it("passes an absolute sting to runDangerfileEnvironment", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    const results = await runDangerAgainstInstallation(`dangerfile_empty.ts`, "", null, dsl.pr)

    const firstArgCalled = mockRunDangerfileEnvironment.mock.calls[0][0]
    expect(firstArgCalled).toContain("/peril/")
  })
})
