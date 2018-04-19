import { GitHubInstallation } from "../db/index"

const emptyInstallation: GitHubInstallation = {
  id: 123,
  repos: {},
  rules: {},
  scheduler: {},
  settings: {
    env_vars: [],
    ignored_repos: [],
    modules: [],
  },
  tasks: {},
  dangerfilePath: "",
}

const generateInstallation = (diff: Partial<GitHubInstallation>): GitHubInstallation =>
  Object.assign({}, emptyInstallation, diff)

export default generateInstallation
