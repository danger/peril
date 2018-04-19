import { createPerilJWT, getDetailsFromPerilJWT, PerilOAuthUser } from "../generate"

it("creates a JWT for a stubbed user", () => {
  const user: PerilOAuthUser = {
    name: "MurphDog",
    github: {},
  }
  const jwt = createPerilJWT(user, [])
  // Just a prefix for now
  expect(jwt).toContain("eyJh")
})

it.skip("gets data from a JWT it generated", async () => {
  const user: PerilOAuthUser = {
    name: "MurphDog",
    github: {},
  }
  const jwt = createPerilJWT(user, [])
  // Just a prefix for now
  const data = await getDetailsFromPerilJWT(jwt)
  expect(data).toEqual(user)
})

it.skip("raises when then JWT is invalid", async () => {
  // Just a prefix for now
  expect(() => getDetailsFromPerilJWT("AASDAFSDF.ASDADSADSAD.ASDASDASD").then(e => e)).toThrow()
})
