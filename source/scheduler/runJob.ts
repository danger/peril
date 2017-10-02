import { scheduleJob } from "node-schedule"
import { getTemporaryAccessTokenForInstallation } from "../api/github"
import { dangerRepresentationforPath, dangerRunForRules } from "../danger/danger_run"
import { runDangerForInstallation } from "../danger/danger_runner"
import { DangerfileReferenceString, GitHubInstallation } from "../db/index"
import { getGitHubFileContents } from "../github/lib/github_helpers"

const runJob = async (installation: GitHubInstallation, rules: DangerfileReferenceString) => {
  const repo = dangerRepresentationforPath(rules)
  // const runs = dangerRunForRules("scheduler", "run", rules)

  const token = await getTemporaryAccessTokenForInstallation(installation.id)

  const baseDangerfile = await getGitHubFileContents(token, repoForDangerfile, repo.sl, branch)

  runDangerForInstallation()
}

export default runJob
