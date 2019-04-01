import { getDB } from "../../../db/getDB"
import { octokitForInstallation } from "./api"

// This is so we can present a UI where you can pick a repo
export const getAvailableReposForInstallation = async (installationID: number) => {
  const db = getDB()
  const installation = await db.getInstallation(installationID)

  if (!installation) {
    throw new Error(`Installation not found`)
  }

  const gh = await octokitForInstallation(installationID)
  // Probably works?
  const allRepos = await gh.paginate(gh.apps.listRepos)

  return allRepos
}
