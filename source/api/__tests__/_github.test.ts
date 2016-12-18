import { jwtForGitHubAuth }  from "../github"

describe("jwt", () => {
  it("Creates a JWT", () => {
    Date = jest.fn(() => { return { getTime: () => 1000 } })

    const jwt = jwtForGitHubAuth()
    // Feel free to throw this into: https://jwt.io
    const token = /eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjEsImV4cCI6NjEsImlzcyI6bnVsbH0/
    expect(jwt).toMatch(token)
  })
})
 