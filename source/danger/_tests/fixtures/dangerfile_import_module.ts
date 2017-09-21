import { checkForRelease } from "danger-plugin-yarn"
checkForRelease({ version: { before: "1.0.0", after: "1.0.1" } })
