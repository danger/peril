import { settingsUpdater } from "../settings_updater"

jest.mock("../../db", () => ({ default: { setup: jest.fn() } }))
jest.mock("../../globals", () => ({ DATABASE_JSON_FILE: "PerilTest/settings@peril.settings.json" }))

import { readFileSync } from "fs"
import { resolve } from "path"

import db from "../../db"

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

  it("db setup is called when the right repo + path is changed", () => {
    const req = requestWithFixturedJSON("push")
    settingsUpdater("push", req, {} as any, {})

    expect(db.setup).toBeCalled()

    // Shouldnt
    expect(res.status).not.toBeCalled()
    expect(res.send).not.toBeCalled()
  })
})
