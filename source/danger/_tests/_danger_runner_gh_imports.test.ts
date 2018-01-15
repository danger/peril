import { appendPerilContextToDSL } from "../danger_runner"

const mockToken = "1234535345"
jest.mock("../../api/github", () => ({ getTemporaryAccessTokenForInstallation: () => Promise.resolve(mockToken) }))

it("adds peril to the DSL", async () => {
  const sandbox = { danger: { github: {} } } as any
  const perilDSL = { perilDSL: true } as any

  await appendPerilContextToDSL(123, sandbox, perilDSL)
  expect(sandbox.peril).toEqual({ perilDSL: true })
})

it("adds a GH API object to the DSL", async () => {
  const sandbox = { danger: { github: {} } } as any
  const perilDSL = { perilDSL: true } as any

  await appendPerilContextToDSL(123, sandbox, perilDSL)

  expect(sandbox.danger.github.api).toBeTruthy()
  expect(sandbox.danger.github.api.auth).toEqual({ token: mockToken, type: "integration" })
})
