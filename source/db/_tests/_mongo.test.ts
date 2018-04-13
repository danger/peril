import installationFactory from "../../testing/installationFactory"
import { ghToMongo, MongoGithubInstallationModel, mongoToGH } from "../mongo"

describe("gh -> mongo", () => {
  it("moves the id to installationID", () => {
    const gh = installationFactory({})
    expect(ghToMongo(gh)).toEqual({
      installationID: 123,
      repos: {},
      rules: {},
      scheduler: {},
      settings: { env_vars: [], ignored_repos: [], modules: [] },
      tasks: {},
    })
  })
})

describe("mongo -> gh", () => {
  it("moves the installationID to id", () => {
    const mongo: MongoGithubInstallationModel = {
      installationID: 1,
      settings: {},
      tasks: {},
      repos: {},
      rules: {},
      scheduler: {},
    } as any

    expect(mongoToGH(mongo)).toEqual({ id: 1, repos: {}, rules: {}, scheduler: {}, settings: {}, tasks: {} })
  })
})

describe("gh -> mongo -> gh", () => {
  it("moves the installationID to id", () => {
    const gh = installationFactory({})

    expect(mongoToGH(ghToMongo(gh))).toEqual(gh)
  })
})
