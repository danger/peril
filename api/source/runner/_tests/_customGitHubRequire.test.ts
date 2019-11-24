import { customGitHubResolveRequest, perilPrefix, shouldUseGitHubOverride } from "../customGitHubRequire"

jest.mock("../../github/lib/github_helpers")
import { getGitHubFileContentsFromLocation } from "../../github/lib/github_helpers"
const mockGH = getGitHubFileContentsFromLocation as jest.Mock

jest.mock("danger/distribution/runner/runners/utils/transpiler")
import transpiler from "danger/distribution/runner/runners/utils/transpiler"
const mockTranspiler = transpiler as jest.Mock

describe("shouldUseGitHubOverride", () => {
  it("ignores module imports ", () => {
    const module = "peril"
    const parent: any = { filename: "index.js" }
    expect(shouldUseGitHubOverride(module, parent)).toBeFalsy()
  })

  it("ignores relative imports in other modules ", () => {
    const module = "./peril"
    const parent: any = { filename: "node_modules/danger/index.js" }
    expect(shouldUseGitHubOverride(module, parent)).toBeFalsy()
  })

  it("accepts relative imports in modules with a parent that has the right prefix ", () => {
    const module = "./peril"
    const parent: any = { filename: perilPrefix + "./my-import" }
    expect(shouldUseGitHubOverride(module, parent)).toBeTruthy()
  })
})

describe("customGitHubResolveRequest", () => {
  it("makes the right GH request for the relative file", async () => {
    const module = "./myapp/peril-resolver"
    const parent: any = { filename: perilPrefix + "orta/peril-settings@my-import" }
    const token = "1231231231"
    const resolver = customGitHubResolveRequest(token)

    mockGH.mockResolvedValueOnce("NOOP") // the transpiler handles this
    mockTranspiler.mockReturnValueOnce("module.exports = { hello: 'world' }")

    const result = await resolver(module, parent)

    // It should make the right API call to
    expect(mockGH).toBeCalledWith(
      token,
      {
        branch: "master",
        dangerfilePath: "myapp/peril-resolver.js",
        referenceString: "orta/peril-settings@/myapp/peril-resolver.js",
        repoSlug: "orta/peril-settings",
      },
      "orta/peril-settings"
    )

    // It should return the transpiled module
    expect(result).toEqual({ hello: "world" })
  })
})
