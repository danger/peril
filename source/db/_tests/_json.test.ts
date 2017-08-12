it("passes", () => {
  // this file when uncommented will not let jest close
  // so... that needs fixing sometime.
})

// const legitSettings = `{
//   "id": 1,
//   "settings": {
//     "onlyForOrgMembers": false
//   },
//   "rules": {
//    "pull_request": "orta/peril@pr.ts",
//    "issue": "orta/peril@issue.ts"
//   },
//   "repos" : {
//     "orta/ORStackView": {
//       "issue.created": "orta/peril@lock_issues.ts"
//     }
//   }
// }`

// const mockContents = jest.fn((token, path) => {
//   if (path === "orta/peril") {
//     return Promise.resolve(legitSettings)
//   }
//   if (path === "orta/other") {
//     return Promise.resolve("")
//   }
// })

// jest.mock("../../github/lib/github_helpers", () => ({ getGitHubFileContents: mockContents }))

// import { DatabaseAdaptor } from "../index"
// import jsonDB from "../json"

// describe.skip("makes the right calls to GitHub", () => {
//   let db: DatabaseAdaptor = null as any

//   beforeEach(async () => {
//     db = jsonDB("orta/peril@settings.json")
//     await db.setup()
//   })

//   it("with a legit stubbed JSON file", async () => {
//     const org = await db.getInstallation(1)
//     expect(org).toMatchSnapshot()
//   })

//   it("gets repo rules correct", async () => {
//     const repo = await db.getRepo(1, "orta/ORStackView")
//     expect(repo).toMatchSnapshot()
//   })
// })

// // need a unhandled rejection from promises?
// it.skip("Raises with a bad URL", () => {
//   const db = jsonDB("orta/other@settings.json")
//   expect(async () => {
//     await db.setup()
//   }).toThrowErrorMatchingSnapshot()
// })
