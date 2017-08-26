import { FakeCI } from "danger/distribution/ci_source/providers/Fake"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { Platform } from "danger/distribution/platforms/platform"

import fixturedGitHub from "../../api/_tests/fixtureAPI"
import {
  executorForInstallation,
  handleDangerResults,
  perilObjectForInstallation,
  runDangerAgainstFile,
} from "../danger_runner"

import { existsSync, readFileSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { basename, resolve } from "path"

const dangerfilesFixtures = resolve(__dirname, "fixtures")
const peril = { env: {} }

describe("evaling", () => {
  it("runs a typescript dangerfile with fixtured data", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    const contents = readFileSync(`${dangerfilesFixtures}/dangerfile_empty.ts`, "utf8")
    const results = await runDangerAgainstFile(`${dangerfilesFixtures}/dangerfile_empty.ts`, contents, executor, peril)
    expect(results).toEqual({
      fails: [],
      markdowns: [],
      messages: [],
      warnings: [{ message: "OK" }],
    })
  })

  it("highlights some of the security measures", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    const path = `${dangerfilesFixtures}/dangerfile_insecure.ts`
    const contents = readFileSync(path, "utf8")

    const results = await runDangerAgainstFile(path, contents, executor, peril)
    expect(results.markdowns).toEqual(["`Object.keys(process.env).length` is 0"])
  })

  it("allows external modules", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    const path = `${dangerfilesFixtures}/dangerfile_import_module.ts`

    const contents = readFileSync(path, "utf8")
    const results = await runDangerAgainstFile(path, contents, executor, peril)
    expect(results.markdowns).toEqual([":tada:"])
  })

  it("allows external modules with internal resolving ", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)

    const localDangerfile = resolve("./dangerfile_runtime_env", "dangerfile_import_complex_module.ts")
    const contents = readFileSync(`${dangerfilesFixtures}/dangerfile_import_module.ts`, "utf8")

    const results = await runDangerAgainstFile(localDangerfile, contents, executor, peril)
    expect(results.markdowns).toEqual([":tada:"])
  })

  it("has a peril object defined in global scope", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)

    const localDangerfile = resolve(`${dangerfilesFixtures}/dangerfile_peril_obj.ts`)
    const contents = readFileSync(`${dangerfilesFixtures}/dangerfile_peril_obj.ts`, "utf8")

    const results = await runDangerAgainstFile(localDangerfile, contents, executor, peril)
    expect(results.markdowns).toEqual([JSON.stringify(peril, null, "  ")])
  })

  // I wonder if the babel setup isn't quite right yet for this test
  it.skip("runs a JS dangerfile with fixtured data", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    // The executor will return results etc in the next release
    const path = `${dangerfilesFixtures}/dangerfile_insecure.ts`

    const contents = readFileSync(path, "utf8")
    const results = await runDangerAgainstFile(path, contents, executor, peril)
    expect(results).toEqual({
      fails: [],
      markdowns: [],
      messages: [],
      warnings: [{ message: "OK" }],
    })
  })

  it("generates the correct modified/deleted/created paths", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    const dsl = await executor.dslForDanger()
    expect(dsl.git.created_files.length).toBeGreaterThan(0)
    expect(dsl.git.modified_files.length).toBeGreaterThan(0)
    expect(dsl.git.deleted_files.length).toBeGreaterThan(0)
  })
})

it("exposes specific process env vars via the peril object ", async () => {
  const installationSettings = {
    env_vars: ["TEST_ENV", "NON_EXISTANT"],
  }

  const fakeProcess = {
    SECRET_ENV: "432",
    TEST_ENV: "123",
  }

  const perilObj = perilObjectForInstallation(installationSettings, fakeProcess)
  expect(perilObj).toEqual({ env: { TEST_ENV: "123" } })
})
