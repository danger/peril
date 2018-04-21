import { GitHubInstallation } from "../db/index"

const emptyInstallation: GitHubInstallation = {
  iID: 123,
  repos: {},
  rules: {},
  scheduler: {},
  settings: {
    env_vars: [],
    ignored_repos: [],
    modules: [],
  },
  tasks: {},
  perilSettingsJSONURL: "",
}

const generateInstallation = (diff: Partial<GitHubInstallation>): GitHubInstallation =>
  Object.assign({}, emptyInstallation, diff)

export default generateInstallation
