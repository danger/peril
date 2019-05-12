import { danger, warn } from "danger"
import { readFileSync } from "fs"

const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md")
if (!hasChangelog) {
  warn("Please add a changelog entry for your changes. You can find it in `CHANGELOG.md`")
}

// Ensure the NodeJS versions match everywhere
const nodeVersion = JSON.parse(readFileSync("package.json", "utf8")).engines.node

if (!readFileSync("../.circleci/config.yml", "utf8").includes("circleci/node:" + nodeVersion)) {
  warn("The `.circleci/config.yml` does not have the same version of node in it (" + nodeVersion + ")")
}

if (
  danger.git.modified_files.includes("source/db/GitHubRepoSettings.ts") &&
  danger.git.modified_files.includes("source/db/index.ts")
) {
  warn("You may need to run `yarn generate:types:schema`.")
}
