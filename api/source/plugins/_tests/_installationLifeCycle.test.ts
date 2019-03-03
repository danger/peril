import { installationLifeCycle } from "../installationLifeCycle"

jest.mock("../../db/getDB")
import { createInstallation } from "../../github/events/create_installation"
import { deleteInstallation } from "../../github/events/deleteInstallation"

jest.mock("../../github/events/create_installation", () => ({ createInstallation: jest.fn() }))
jest.mock("../../github/events/deleteInstallation", () => ({ deleteInstallation: jest.fn() }))

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

    expect(deleteInstallation).toBeCalled()
  })

  it("skips a non-installation event", async () => {
    const body = {
      action: "created",
      created: false,
      deleted: false,
      forced: false,
    }
    installationLifeCycle("push", { ...validRequest, body }, {} as any, {} as any)
    expect(createInstallation).toBeCalled()
  })
})
