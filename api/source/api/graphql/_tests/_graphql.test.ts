import { graphql } from "graphql"
import { createPerilUserJWT } from "../../auth/generate"
import { gql } from "../gql"
import { schema } from "../index"

jest.mock("../../../db/getDB")
import { MockDB } from "../../../db/__mocks__/getDB"
import { getDB } from "../../../db/getDB"
import { generateInstallation } from "../../../testing/installationFactory"
const mockDB = getDB() as MockDB

beforeEach(() => mockDB.clear())

describe("simple queries", () => {
  const queryMe = gql`
    {
      me {
        name
      }
    }
  `

  it("pulls user details out of the JWT", async () => {
    const jwt = createPerilUserJWT({ name: "Orta", avatar_url: "hi" }, [123])
    const result = await graphql(schema, queryMe, null, { jwt })

    expect(result).toEqual({ data: { me: { name: "Orta" } } })
  })

  it("errors when the JWT is wrong", async () => {
    const result = await graphql(schema, queryMe, null, { jwt: "asdasqweqweasdasd" })
    expect(result).toEqual({ data: { me: null }, errors: [expect.anything()] })
  })
})

describe("my installation queries", () => {
  const queryMyInstallations = gql`
    {
      me {
        installations {
          edges {
            node {
              login
            }
          }
        }
      }
    }
  `

  const queryMyUnfinishedInstallations = gql`
    {
      me {
        installationsToSetUp {
          edges {
            node {
              login
            }
          }
        }
      }
    }
  `

  it("gets an installation that you have access to in the JWT", async () => {
    // It needs an installation with perilSettingsJSONURL to pass
    mockDB.getInstallations.mockReturnValueOnce([
      generateInstallation({ iID: 123, login: "Test", perilSettingsJSONURL: "a/b@c.ts" }),
    ])

    const jwt = createPerilUserJWT({ name: "Orta", avatar_url: "hi" }, [123])
    const result = await graphql(schema, queryMyInstallations, null, { jwt })

    const response = { data: { me: { installations: { edges: [{ node: { login: "Test" } }] } } } }
    expect(result).toEqual(response)

    expect(mockDB.getInstallations).toBeCalledWith([123])
  })

  it("doesn't include installations without perilSettingsJSON", async () => {
    mockDB.getInstallations.mockReturnValueOnce([generateInstallation({ iID: 1231, login: "Test" })])

    const jwt = createPerilUserJWT({ name: "Orta", avatar_url: "hi" }, [123])
    const result = await graphql(schema, queryMyInstallations, null, { jwt })

    const response = { data: { me: { installations: { edges: [] } } } }
    expect(result).toEqual(response)

    expect(mockDB.getInstallations).toBeCalledWith([123])
  })

  it("doesn't include installations without perilSettingsJSON", async () => {
    mockDB.getInstallations.mockReturnValueOnce([generateInstallation({ iID: 1231, login: "Test" })])

    const jwt = createPerilUserJWT({ name: "Orta", avatar_url: "hi" }, [123])
    const result = await graphql(schema, queryMyUnfinishedInstallations, null, { jwt })

    const response = { data: { me: { installationsToSetUp: { edges: [{ node: { login: "Test" } }] } } } }
    expect(result).toEqual(response)

    expect(mockDB.getInstallations).toBeCalledWith([123])
  })
})

describe("an installation queries", () => {
  const queryInstallation = (id: number) => gql`
    {
      installation(iID: ${id}) {
        login
      }
    }
  `

  it("gets an installation that you have access to in the JWT", async () => {
    // It needs an installation with perilSettingsJSONURL to pass
    mockDB.getInstallations.mockReturnValueOnce([
      generateInstallation({ iID: 123, login: "Test", perilSettingsJSONURL: "a/b@c.ts" }),
    ])

    const jwt = createPerilUserJWT({ name: "Orta", avatar_url: "hi" }, [123])
    const result = await graphql(schema, queryInstallation(123), null, { jwt })

    const response = { data: { installation: { login: "Test" } } }
    expect(result).toEqual(response)

    expect(mockDB.getInstallations).toBeCalledWith([123])
  })

  it("does not get an installation that you do not have access to in the JWT", async () => {
    // It needs an installation with perilSettingsJSONURL to pass
    mockDB.getInstallations.mockReturnValueOnce([
      generateInstallation({ iID: 123, login: "Test", perilSettingsJSONURL: "a/b@c.ts" }),
    ])

    const jwt = createPerilUserJWT({ name: "Orta", avatar_url: "hi" }, [123])
    const result = await graphql(schema, queryInstallation(312), null, { jwt })

    const response = { data: { installation: null } }
    expect(result).toEqual(response)

    expect(mockDB.getInstallations).toBeCalledWith([123])
  })
})
