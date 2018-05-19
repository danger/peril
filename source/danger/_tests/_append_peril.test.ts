jest.mock("../../db/getDB")
import { MockDB } from "../../db/__mocks__/getDB"
import { getDB } from "../../db/getDB"
const mockDB = getDB() as MockDB

import { perilObjectForInstallation } from "../../danger/append_peril"
import { GitHubInstallationSettings } from "../../db/GitHubRepoSettings"

jest.mock("../../api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve("123"),
}))

it("exposes specific process env vars via the peril object ", async () => {
  mockDB.getInstallation.mockReturnValueOnce(
    Promise.resolve({
      envVars: { TEST_ENV: 312 },
    })
  )

  const processInstallationSettings: GitHubInstallationSettings = {
    env_vars: [],
    ignored_repos: [],
    modules: [],
  }

  const perilObj = await perilObjectForInstallation({ iID: 1, settings: processInstallationSettings }, null, false)
  expect(perilObj.env).toEqual({ TEST_ENV: "321" })
})
