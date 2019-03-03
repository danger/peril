import { GitHubInstallation } from "../db/index"

const emptyInstallation: GitHubInstallation = {
  iID: 123,
  login: "",
  avatarURL: "",
  repos: {},
  rules: {},
  lambdaName: "",
  scheduler: {},
  settings: {
    env_vars: [],
    ignored_repos: [],
    modules: [],
  },
  tasks: {},
  perilSettingsJSONURL: "",
  installationSlackUpdateWebhookURL: "",
}

/** Creates an installation from a blank template */
export const generateInstallation = (diff: Partial<GitHubInstallation>): GitHubInstallation =>
  Object.assign({}, emptyInstallation, diff)
