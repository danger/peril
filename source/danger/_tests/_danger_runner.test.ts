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

import { resolve } from "path"
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
