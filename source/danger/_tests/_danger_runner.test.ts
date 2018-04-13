import { PerilDSL } from "danger/distribution/dsl/DangerDSL"
import vm2 from "danger/distribution/runner/runners/vm2"
import { readFileSync } from "fs"
import { resolve } from "path"

import fixturedGitHub from "../../api/_tests/fixtureAPI"
import { perilObjectForInstallation } from "../../danger/append_peril"
import { GitHubInstallationSettings } from "../../db/GitHubRepoSettings"
import { executorForInstallation, runDangerAgainstFileInline } from "../danger_runner"

const dangerfilesFixtures = resolve(__dirname, "fixtures")
const peril: PerilDSL = { env: {}, runTask: () => null }

jest.mock("../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("123"),
}))

const emptySettings = {
  env_vars: [],
  ignored_repos: [],
  modules: [],
}

const installationSettings = {
  id: 123,
  settings: emptySettings,
}

// @ts-ignore
global.regeneratorRuntime = {}

describe("evaling", () => {
  it("runs a typescript dangerfile with fixtured data", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform, vm2)
    const contents = readFileSync(`${dangerfilesFixtures}/dangerfile_empty.ts`, "utf8")
    const results = await runDangerAgainstFileInline(
      `${dangerfilesFixtures}/dangerfile_empty.ts`,
      contents,
      installationSettings,
      executor,
      peril
    )
    expect(results).toEqual({
      fails: [],
      markdowns: [],
      messages: [],
      warnings: [{ message: "OK" }],
    })
  })

  it("highlights some of the security measures", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform, vm2)
    const path = `${dangerfilesFixtures}/dangerfile_insecure.ts`
    const contents = readFileSync(path, "utf8")

    const results = await runDangerAgainstFileInline(path, contents, installationSettings, executor, peril)
    expect(results.markdowns.map(m => m.message)).toEqual(["`Object.keys(process.env).length` is 0"])
  })

  // Wallaby can't resolve these
  if (!process.env.WALLABY_PRODUCTION) {
    it("allows external modules", async () => {
      const platform = fixturedGitHub()
      const executor = executorForInstallation(platform, vm2)
      const path = `${dangerfilesFixtures}/dangerfile_import_module.ts`

      const contents = readFileSync(path, "utf8")
      const results = await runDangerAgainstFileInline(path, contents, installationSettings, executor, peril)
      expect(results.messages).toEqual([{ message: ":tada: - congrats on your new release" }])
    })

    it("allows external modules with internal resolving ", async () => {
      const platform = fixturedGitHub()
      const executor = executorForInstallation(platform, vm2)

      const localDangerfile = resolve("./dangerfile_runtime_env", "dangerfile_import_complex_module.ts")
      const contents = readFileSync(`${dangerfilesFixtures}/dangerfile_import_module.ts`, "utf8")

      const results = await runDangerAgainstFileInline(localDangerfile, contents, installationSettings, executor, peril)
      expect(results.messages).toEqual([{ message: ":tada: - congrats on your new release" }])
    })
  }

  it("has a peril object defined in global scope", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform, vm2)

    const localDangerfile = resolve(`${dangerfilesFixtures}/dangerfile_peril_obj.ts`)
    const contents = readFileSync(`${dangerfilesFixtures}/dangerfile_peril_obj.ts`, "utf8")

    const results = await runDangerAgainstFileInline(localDangerfile, contents, installationSettings, executor, peril)
    expect(results.markdowns.map(m => m.message)).toEqual([JSON.stringify(peril, null, "  ")])
  })

  // I wonder if the babel setup isn't quite right yet for this test
  it.skip("runs a JS dangerfile with fixtured data", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform, vm2)
    // The executor will return results etc in the next release
    const path = `${dangerfilesFixtures}/dangerfile_insecure.ts`

    const contents = readFileSync(path, "utf8")
    const results = await runDangerAgainstFileInline(path, contents, installationSettings, executor, peril)
    expect(results).toEqual({
      fails: [],
      markdowns: [],
      messages: [],
      warnings: [{ message: "OK" }],
    })
  })

  it("generates the correct modified/deleted/created paths", async () => {
    const platform = fixturedGitHub()
    const executor = executorForInstallation(platform, vm2)
    const dsl = await executor.dslForDanger()
    expect(dsl.git.created_files.length).toBeGreaterThan(0)
    expect(dsl.git.modified_files.length).toBeGreaterThan(0)
    expect(dsl.git.deleted_files.length).toBeGreaterThan(0)
  })
})

it("exposes specific process env vars via the peril object ", async () => {
  const processInstallationSettings: GitHubInstallationSettings = {
    env_vars: ["TEST_ENV", "NON_EXISTANT"],
    ignored_repos: [],
    modules: [],
  }

  const fakeProcess = {
    SECRET_ENV: "432",
    TEST_ENV: "123",
  }

  const perilObj = perilObjectForInstallation({ id: 1, settings: processInstallationSettings }, fakeProcess, false)
  expect(perilObj.env).toEqual({ TEST_ENV: "123" })
})

it("allows passing through Peril DSL attributes ", async () => {
  const processInstallationSettings: GitHubInstallationSettings = {
    env_vars: ["TEST_ENV", "NON_EXISTANT"],
    ignored_repos: [],
    modules: [],
  }

  const fakeProcess = {
    SECRET_ENV: "432",
    TEST_ENV: "123",
  }

  const perilDSL = {
    a: "b",
  }

  const perilObj = perilObjectForInstallation(
    { id: 1, settings: processInstallationSettings },
    fakeProcess,
    perilDSL
  ) as any
  expect(perilObj.a).toEqual("b")
})
