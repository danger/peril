import { getDB } from "../../../db/getDB"
import { octokitForInstallation } from "./api"

import { fileMapForPerilSettingsRepo, NewRepoOptions } from "@peril/utils"

import { createOrUpdatePR } from "danger/distribution/platforms/github/GitHubUtils"

// Submits a PR with the metadata, and returns the PR JSON
export const sendPRForPerilSettingsRepo = async (installationID: number, options: NewRepoOptions) => {
  const db = getDB()
  const installation = await db.getInstallation(installationID)

  if (!installation) {
    throw new Error(`Installation not found`)
  }

  const gh = await octokitForInstallation(installationID)

  const fileMap = await fileMapForPerilSettingsRepo(gh as any, options)
  const builder = createOrUpdatePR(undefined, gh)

  const newPR = await builder(
    {
      owner: installation.login,
      repo: options.repo.name,
      title: "Initial setup for your Peril Repo",
      baseBranch: "master",
      commitMessage: "Initial Commit",
      body: "Welcome to Peril",
      newBranchName: "peril_settings_init",
    },
    fileMap
  )
  return newPR.data
}
