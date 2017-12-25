import { dsl } from "../../danger/danger_run"
import { GitHubInstallation } from "../../db/index"
import runJob from "../runJob"

jest.mock("../../api/github", () => ({ getTemporaryAccessTokenForInstallation: () => Promise.resolve("token123") }))

jest.mock("../../github/lib/github_helpers", () => ({
  getGitHubFileContents: jest.fn(),
}))
import { getGitHubFileContents } from "../../github/lib/github_helpers"

jest.mock("../../danger/danger_runner", () => ({
  runDangerForInstallation: jest.fn(),
}))
import { runDangerForInstallation } from "../../danger/danger_runner"

const installation: GitHubInstallation = {
  id: 123,
  repos: {},
  rules: {},
  scheduler: {},
  settings: {
    env_vars: [],
    ignored_repos: [],
    modules: [],
  },
}

const contents = getGitHubFileContents as any

it("runs a dangerfile", async () => {
  contents.mockImplementationOnce(() => Promise.resolve("file"))

  await runJob(installation, "danger/danger-repo@hello.ts")

  expect(runDangerForInstallation).toBeCalledWith("file", "hello.ts", null, dsl.import, installation, {})
})

jest.mock("../../globals", () => ({ DATABASE_JSON_FILE: "private/repo" }))

it("uses the project settings repo when no repo is passsed", async () => {
  contents.mockImplementationOnce(() => Promise.resolve("file"))

  await runJob(installation, "weekly.ts")

  expect(getGitHubFileContents).toBeCalledWith("token123", "private/repo", "weekly.ts", "master")
})
