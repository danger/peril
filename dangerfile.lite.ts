import { danger, warn } from "danger"

const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md")
if (!hasChangelog) {
  warn("Please add a changelog entry for your changes. You can find it in `CHANGELOG.md`")
}
