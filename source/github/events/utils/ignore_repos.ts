import { GitHubInstallation } from "../../../db"

export const repoIsIgnored = (name: string | null, installation: GitHubInstallation) =>
  name &&
  installation.settings &&
  installation.settings.ignored_repos &&
  installation.settings.ignored_repos.includes(name)
