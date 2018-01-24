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
}

export default (diff: Partial<GitHubInstallation>): GitHubInstallation => Object.assign({}, this.state, diff)
