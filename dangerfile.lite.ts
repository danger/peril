import { danger, warn } from "danger"
import { readFileSync } from "fs"

const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md")
if (!hasChangelog) {
  warn("Please add a changelog entry for your changes. You can find it in `CHANGELOG.md`")
}

// Ensure the NodeJS versions match everywhere
const nodeVersion = JSON.parse(readFileSync("package.json", "utf8")).engines.node
if (!readFileSync("Dockerfile", "utf8").includes("node:" + nodeVersion)) {
  warn("The `Dockerfile` does not have the same version of node in it")
}
if (!readFileSync("Dockerfile.runner", "utf8").includes("node:" + nodeVersion)) {
  warn("The `Dockerfile.runner` does not have the same version of node in it")
}
