import { jwtForGitHubAuth } from "../github"

describe("jwt", () => {
  it("is an empty test", () => {
    expect("Hi").toEqual("Hi")
  })

  if (process.env.USER === "orta") {
    it("Creates a JWT", () => {
      global.Date = jest.fn(() => ({ getTime: () => 1000 })) as any

      const jwt = jwtForGitHubAuth()
      // Feel free to throw this into: https://jwt.io
      const token = /eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9/
      expect(jwt).toMatch(token)
    })
  }
})
