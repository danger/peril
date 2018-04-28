import { installationLifeCycle } from "../installationLifeCycle"

jest.mock("../../db/getDB")
import { getDB } from "../../db/getDB"
import { createInstallation } from "../../github/events/create_installation"

jest.mock("../../github/events/create_installation", () => ({ createInstallation: jest.fn() }))
const validRequest = { body: { installation: { id: 123 } } } as any

describe("routing for GitHub", () => {
  it("creates an installation when an integration is created", async () => {
    const body = { action: "created", installation: { account: { login: "Orta" } } }
    await installationLifeCycle("installation", { ...validRequest, body }, {} as any, {} as any)
    expect(createInstallation).toBeCalled()
  })

  it("deletes an installation when an integration is removed", () => {
    const body = { action: "deleted", installation: { id: 12345 } }
    installationLifeCycle("installation", { ...validRequest, body }, {} as any, {} as any)

    expect(getDB().deleteInstallation).toBeCalledWith(12345)
  })
})
