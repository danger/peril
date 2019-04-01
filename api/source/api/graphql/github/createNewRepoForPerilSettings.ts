import { getDB } from "../../../db/getDB"
import { octokitForInstallation } from "./api"

// This is so we can present a UI where you can create a repo
//
// Note: this only works on a GitHub org, not a user!
//
export const createNewRepoForPerilSettings = async (installationID: number, repoName: string, privateRepo: boolean) => {
  const db = getDB()
  const installation = await db.getInstallation(installationID)

  if (!installation) {
    throw new Error(`Installation not found`)
  }

  const gh = await octokitForInstallation(installationID)

  const description = "The Peril Settings repo"
  const homepage = "https://peril.systems/docs"

  const newRepo = await gh.repos.createInOrg({
    has_wiki: false,
    org: installation.login,
    name: repoName,
    private: privateRepo,
    description,
    homepage,
  })

  return newRepo.data
}
