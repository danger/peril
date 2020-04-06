import { Octokit as GitHub } from "@octokit/rest"
import { getTemporaryAccessTokenForInstallation } from "../../github"

export const octokitForInstallation = async (installationID: number) => {
  const gh = new GitHub()
  const token = await getTemporaryAccessTokenForInstallation(installationID)
  gh.authenticate({ type: "app", token })
  return gh
}
