import { jwtForGitHubAuth }  from "../github"

describe("jwt", () => {
  it("Creates a JWT", () => {
    global.Date = jest.fn(() => { return { getTime: () => 1000 } }) as any

    const jwt = jwtForGitHubAuth()
    // Feel free to throw this into: https://jwt.io
    const token = /eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9/
    expect(jwt).toMatch(token)
  })
})
