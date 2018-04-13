import { readFileSync } from "fs"
import { resolve } from "path"

const apiFixtures = resolve(__dirname, "fixtures")
const fixture = (file: string) => JSON.parse(readFileSync(resolve(apiFixtures, file), "utf8"))
const body = fixture("pull_request_opened.json")

const mockInstallationSettings: GitHubInstallation = {
  id: 123,
  repos: {},
  rules: {},
  scheduler: {},
  settings: {
    env_vars: [],
    ignored_repos: [body.pull_request.head.repo.full_name],
    modules: [],
  },
  tasks: {},
}

jest.doMock("../../../db/getDB", () => ({
  getDB: () => ({
    getInstallation: () => Promise.resolve(mockInstallationSettings),
  }),
}))

import { GitHubInstallation } from "../../../db"
import { githubDangerRunner } from "../github_runner"

it("Does not run a dangerfile in an ignored repo", async () => {
  const request = { body, headers: { "X-GitHub-Delivery": "12345" } } as any

  const send = { send: jest.fn() }
  const response = { status: jest.fn(() => send) } as any

  await githubDangerRunner("pull_request_opened", request, response, () => "")

  expect(response.status).toHaveBeenCalledWith(200)
  expect(send.send).toHaveBeenCalledWith("Skipping peril run due to repo being in ignored")
})
