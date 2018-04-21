import { createPerilJWT, getDetailsFromPerilJWT, PerilOAuthUser } from "../generate"

global.Date = jest.fn(() => ({ getTime: () => 1000 })) as any
global.Date.now = () => 2000

it("creates a JWT for a stubbed user", () => {
  const user: PerilOAuthUser = {
    name: "MurphDog",
    avatar_url: "123",
  }
  const jwt = createPerilJWT(user, [])
  // Just a prefix for now
  expect(jwt).toContain("eyJh")
})

it("gets data from a JWT it generated", async () => {
  const user: PerilOAuthUser = {
    name: "MurphDog",
    avatar_url: "123",
  }
  const installations = [1]
  const jwt = createPerilJWT(user, installations)
  // Just a prefix for now
  const data = await getDetailsFromPerilJWT(jwt)
  expect(data).toEqual({ data: { user: { avatar_url: "123", name: "MurphDog" } }, exp: 7776001, iat: 1, iss: ["1"] })
})

it("raises when then JWT is invalid", async () => {
  await expect(getDetailsFromPerilJWT("AASDAFSDF.ASDADSADSAD.ASDASDASD")).rejects.toThrow()
})
