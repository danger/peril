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

const dangerfilesFixtures = resolve(__dirname, "fixtures")

describe("evaling", () => {
  it("runs a typescript dangerfile with fixtured data", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    const results = await runDangerAgainstFile(`${dangerfilesFixtures}/dangerfile_empty.ts`, executor)
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
    const results = await runDangerAgainstFile(`${dangerfilesFixtures}/dangerfile_insecure.ts`, executor)
    expect(results.markdowns).toEqual(["`Object.keys(process.env).length` is 0"])
  })

  it("allows external modules", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    const results = await runDangerAgainstFile(`${dangerfilesFixtures}/dangerfile_import_module.ts`, executor)
    expect(results.markdowns).toEqual([":tada:"])
  })

  it("allows external modules when in a sandbox'd folder", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)

    const randomName = Math.random().toString(36)
    const localDangerfile = resolve("./dangerfile_runtime_env", "danger-testing-import.ts")
    const contents = readFileSync(`${dangerfilesFixtures}/dangerfile_import_module.ts`, "utf8")
    if (!existsSync(localDangerfile)) {
      writeFileSync(localDangerfile, contents, { encoding: "utf8" })
    }

    const results = await runDangerAgainstFile(localDangerfile, executor)
    expect(results.markdowns).toEqual([":tada:"])
  })

  // I wonder if the babel setup isn't quite right yet for this test
  it.skip("runs a JS dangerfile with fixtured data", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform)
    // The executor will return results etc in the next release
    const results = await runDangerAgainstFile(`${dangerfilesFixtures}/dangerfile_insecure.js`, executor)
    expect(results).toEqual({
      fails: [],
      markdowns: [],
      messages: [],
      warnings: [{ message: "OK" }],
    })
  })

  it("does not allow access to the `process` global")
})
