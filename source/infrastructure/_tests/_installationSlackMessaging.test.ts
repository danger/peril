import { replaceAllKeysInString } from "../installationSlackMessaging"

describe("removes keys", () => {
  it("does string changes easy ones", () => {
    let output = replaceAllKeysInString({ MY_KEY: "secret" }, "thing with a secret word")
    expect(output).not.toContain("secret")

    output = replaceAllKeysInString({ MY_KEY: "secret" }, "thing with a secret word secret ok secreting")
    expect(output).not.toContain("secret")
  })

  it("handles null objects", () => {
    const output = replaceAllKeysInString(undefined, "thing with a secret word")
    expect(output).toContain("secret")
  })
})
