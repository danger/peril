import { appendPerilContextToDSL } from "../../danger/append_peril"

const mockToken = "1234535345"
jest.mock("api/github", () => ({
  getTemporaryAccessTokenForInstallation: () => Promise.resolve(mockToken),
}))

it("adds peril to the DSL", async () => {
  const sandbox = { danger: { github: {} } } as any
  const perilDSL = { perilDSL: true } as any

  await appendPerilContextToDSL(123, undefined, sandbox, perilDSL)
  expect(sandbox.peril).toEqual({ perilDSL: true })
})

it("adds a GH API object to the DSL", async () => {
  const sandbox = { danger: { github: {} } } as any
  const perilDSL = { perilDSL: true } as any

  await appendPerilContextToDSL(123, undefined, sandbox, perilDSL)

  expect(sandbox.danger.github.api).toBeTruthy()

  // The older API used to allow checjing for the auth methods
  // as of version 14, you can't ge tto it as it's a plugin
  // expect(sandbox.danger.github.api.auth).toEqual({ token: mockToken, type: "integration" })
})
