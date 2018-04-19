import { settingsUpdater } from "../settings_updater"

const mockSetup = jest.fn()
jest.mock("../../db/getDB", () => ({
  getDB: () => ({ setup: mockSetup }),
}))

jest.mock("../../globals", () => ({
  DATABASE_JSON_FILE: "PerilTest/settings@peril.settings.json",
}))

import { readFileSync } from "fs"
import { resolve } from "path"

const requestWithFixturedJSON = (name: string): any => {
  const path = resolve(__dirname, "../../github/events/_tests", "fixtures", `${name}.json`)
  return { body: JSON.parse(readFileSync(path, "utf8")) }
}

describe("with webhooks from GitHub", () => {
  let res: any

  beforeEach(() => {
    res = {}
    res.status = jest.fn(() => res)
    res.send = jest.fn()
  })

  it("is not called for ping", () => {
    settingsUpdater("ping", {} as any, res, {})
    expect(res.status).not.toBeCalled()
    expect(res.send).not.toBeCalled()
  })

  it.skip("db setup is called when the right repo + path is changed", () => {
    const req = requestWithFixturedJSON("push")
    settingsUpdater("push", req, {} as any, {})

    expect(mockSetup).toBeCalled()

    // Shouldnt
    expect(res.status).not.toBeCalled()
    expect(res.send).not.toBeCalled()
  })
})
