import { graphql } from "graphql"
import { gql } from "../../gql"
import { schema } from "../../index"

jest.mock("../../../../db/getDB")
import { MockDB } from "../../../../db/__mocks__/getDB"
import { getDB } from "../../../../db/getDB"
import { createPerilSandboxAPIJWT } from "../../../../runner/sandbox/jwt"

jest.mock("../../../api", () => ({
  sendMessageToConnectionsWithAccessToInstallation: jest.fn(),
  sendAsyncMessageToConnectionsWithAccessToInstallation: jest.fn(),
}))
import { sendMessageToConnectionsWithAccessToInstallation } from "../../../api"

const mockDB = getDB() as MockDB

beforeEach(() => mockDB.clear())

describe("handle mutations", () => {
  it("sends a message to all connected clients", async () => {
    mockDB.getInstallation.mockReturnValueOnce({ iID: 1 })
    const sandboxJWT = createPerilSandboxAPIJWT(1, ["dangerfileFinished"])

    const mutate = gql`
      mutation {
        dangerfileFinished(
          jwt: "${sandboxJWT}",
          name: "mockEvent",
          dangerfiles: ["app.ts"],
          time: 123,
          hyperCallID: "123-654"
        ) {
          success
        }
      }
    `

    const result = await graphql(schema, mutate, null, {})
    expect(result).toEqual({ data: { dangerfileFinished: { success: true } } })

    expect(sendMessageToConnectionsWithAccessToInstallation).toBeCalledWith(1, {
      event: "mockEvent",
      action: "finished",
      filenames: ["app.ts"],
      time: 123,
    })
  })
})
