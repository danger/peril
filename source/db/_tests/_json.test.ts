const legitSettings = `{
  "id": 1,
  "settings": {
  },
  "rules": {
   "pull_request": "orta/peril@pr.ts",
   "issue": "orta/peril@issue.ts"
  },
  "repos" : {
    "orta/ORStackView": {
      "issue.created": "orta/peril@lock_issues.ts"
    }
  }
}`

const mockGHContents = jest.fn()
jest.mock("../../github/lib/github_helpers", () => ({
  getGitHubFileContentsWithoutToken: mockGHContents,
}))

import { DatabaseAdaptor } from "../index"
import jsonDB from "../json"

describe("makes the right calls to GitHub", () => {
  let db: DatabaseAdaptor = null as any

  const setup = async () => {
    mockGHContents.mockImplementationOnce(() => Promise.resolve(legitSettings))

    db = jsonDB("orta/peril@settings.json")
    return db.setup()
  }

  it("with a legit stubbed JSON file", async () => {
    await setup()

    const org = await db.getInstallation(1)
    expect(org).toMatchSnapshot()
  })
})

it("Raises with a bad URL", async () => {
  mockGHContents.mockImplementationOnce(() => Promise.resolve(""))
  expect.assertions(1)

  try {
    const db = jsonDB("orta/other@settings.json")
    await db.setup()
  } catch (error) {
    expect(error).toMatchSnapshot()
  }
})
