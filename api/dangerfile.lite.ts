import { danger, warn } from "danger"
import { readFileSync } from "fs"

const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md")
if (!hasChangelog) {
  warn("Please add a changelog entry for your changes. You can find it in `CHANGELOG.md`")
}

// Ensure the NodeJS versions match everywhere
const nodeVersion = JSON.parse(readFileSync("package.json", "utf8")).engines.node
if (!readFileSync("api/Dockerfile", "utf8").includes("node:" + nodeVersion)) {
  warn("The `Dockerfile` does not have the same version of node in it")
}
if (!readFileSync("../.travis.yml", "utf8").includes("node_js: " + nodeVersion)) {
  warn("The `.travis.yml` does not have the same version of node in it")
}

if (
  danger.git.modified_files.includes("source/db/GitHubRepoSettings.ts") &&
  danger.git.modified_files.includes("source/db/index.ts")
) {
  warn("You may need to run `yarn generate:types:schema`.")
}
