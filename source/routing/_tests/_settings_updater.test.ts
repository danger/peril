import { settingsUpdater } from "../settings_updater"

const mockGetInstallation = jest.fn()
const mockUpdateInstallation = jest.fn()

jest.mock("../../db/getDB", () => ({
  getDB: () => ({ getInstallation: mockGetInstallation, updateInstallation: mockUpdateInstallation }),
}))

jest.mock("../../globals", () => ({
  DATABASE_JSON_FILE: "PerilTest/settings@peril.settings.json",
}))

import { readFileSync } from "fs"
import { resolve } from "path"
import generateInstallation from "../../testing/installationFactory"

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
    mockUpdateInstallation.mockClear()
  })

  it("is not called for ping", () => {
    settingsUpdater("ping", {} as any, res, {})
    expect(res.status).not.toBeCalled()
    expect(res.send).not.toBeCalled()
  })

  describe("on pushes", () => {
    it("db setup is called when the right repo + path is changed", async () => {
      const req = requestWithFixturedJSON("push")
      mockGetInstallation.mockReturnValueOnce(
        generateInstallation({
          iID: 1234,
          perilSettingsJSONURL: "PerilTest/settings@peril.settings.json",
        })
      )

      await settingsUpdater("push", req, {} as any, {})

      // We get told to update the installation
      expect(mockUpdateInstallation).toBeCalled()

      // Shouldnt
      expect(res.status).not.toBeCalled()
      expect(res.send).not.toBeCalled()
    })
  })

  describe("on PRs", () => {
    it("db setup is called when the right repo", async () => {
      const req = requestWithFixturedJSON("pull_request_closed")
      mockGetInstallation.mockReturnValueOnce(
        generateInstallation({
          iID: 1234,
          perilSettingsJSONURL: "danger/peril@peril.settings.json",
        })
      )

      await settingsUpdater("pull_request", req, {} as any, {})

      // We get told to update the installation
      expect(mockUpdateInstallation).toBeCalled()

      // Shouldnt
      expect(res.status).not.toBeCalled()
      expect(res.send).not.toBeCalled()
    })

    it("db setup is called when the right repo", async () => {
      const req = requestWithFixturedJSON("pull_request_closed")
      mockGetInstallation.mockReturnValueOnce(
        generateInstallation({
          iID: 1234,
          perilSettingsJSONURL: "PerilTest/other_repo@peril.settings.json",
        })
      )

      await settingsUpdater("pull_request", req, {} as any, {})

      // We get told to update the installation
      expect(mockUpdateInstallation).not.toBeCalled()
    })
  })
})
