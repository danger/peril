import { RunType } from "../../danger/danger_run"
import runJob from "../runJob"

jest.mock("../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("token123"),
}))

jest.mock("../../github/lib/github_helpers", () => ({
  getGitHubFileContents: jest.fn(),
}))
import { getGitHubFileContents } from "../../github/lib/github_helpers"

jest.mock("../../danger/danger_runner", () => ({
  runDangerForInstallation: jest.fn(),
}))
import { runDangerForInstallation } from "../../danger/danger_runner"
import generateInstallation from "../../testing/installationFactory"

const installation = generateInstallation({ iID: 123, perilSettingsJSONURL: "private/repo@settings.json" })
const contents = getGitHubFileContents as any

it("runs a dangerfile", async () => {
  contents.mockImplementationOnce(() => Promise.resolve("file"))

  await runJob(installation, "danger/danger-repo@hello.ts")

  expect(runDangerForInstallation).toBeCalledWith(
    ["file"],
    ["hello.ts"],
    null,
    RunType.import,
    installation,
    expect.anything()
  )
})

it("uses the installation settings repo when no repo is passed", async () => {
  contents.mockImplementationOnce(() => Promise.resolve("file"))

  await runJob(installation, "weekly.ts")

  expect(getGitHubFileContents).toBeCalledWith("token123", "private/repo", "weekly.ts", "master")
})
