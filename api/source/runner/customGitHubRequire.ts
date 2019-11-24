import * as requireFromString from "require-from-string"

import cleanDangerfile from "danger/distribution/runner/runners/utils/cleanDangerfile"
import transpiler from "danger/distribution/runner/runners/utils/transpiler"
import { dirname, extname, resolve } from "path"
import { dangerRepresentationForPath } from "../danger/danger_run"
import { getGitHubFileContentsFromLocation } from "../github/lib/github_helpers"
import logger from "../logger"

// This prefix gets stamped on to reference strings when when grabbing via the GH API
export const perilPrefix = "peril-downloaded-"

// Setup a callback used to determine whether a specific `require` invocation
// needs to be overridden.
export const shouldUseGitHubOverride = (request: string, parent: NodeModule): boolean => {
  // Is it a from a file we're handling, and is it relative?

  // In environments like heroku there is an /app/ prefix. This regex
  // checks that the file is peril downloaded
  const checkFileRegex = new RegExp(".*\\/*" + perilPrefix + ".*..*")
  if (checkFileRegex.test(parent.filename) && request.startsWith(".")) {
    return true
  }
  // Basically any import that's not a relative import from a Dangerfile
  return false
}

// We want to handle relative imports inside a Dangerfile, this custom version of the require func
// returns a Promise instead of the normal object, and so you would use `await require("./thing")`
// Which TypeScript handles just as you'd expect

export const customGitHubResolveRequest = (token: string) => async (request: string, parent: NodeModule) => {
  const prefixLessParent = parent.filename.replace(new RegExp(".*\\/*" + perilPrefix), "")
  logger.debug(`Grabbing relative import "${request}" to ${prefixLessParent}.`)

  const dangerRep = dangerRepresentationForPath(prefixLessParent)
  // This is the un-prefixed local path for the module requested`./thing`
  const localPath = resolve(dirname(dangerRep.dangerfilePath), request).replace(resolve(""), "")

  // It's possible that you're jumping between a *.ts and a *.js - it's weird, sure, but I'll allow it
  const extensions = extname(prefixLessParent) === ".ts" ? [".ts", ".js"] : [".js", ".ts"]

  for (const ext of extensions) {
    // Make a new reference string by resolving the old path and appending the extension
    const newReferenceString = prefixLessParent.replace(dangerRep.dangerfilePath, localPath) + ext
    const newRep = dangerRepresentationForPath(newReferenceString)

    // Not supported right now
    if (!newRep.repoSlug) {
      throw new Error("Relative imports don't work without a repo slug in the dangerfile reference.")
    }

    // Try grabbing the file from github
    const dangerfileContent = await getGitHubFileContentsFromLocation(token, newRep, newRep.repoSlug)
    if (dangerfileContent) {
      // We want to ensure we don't lose the prefix for any potential imports in there
      const newPerilFileReference = `${perilPrefix}${newReferenceString}`
      // Remove the danger import
      const newDangerfile = cleanDangerfile(dangerfileContent)
      // Cool, transpile it into something we can run
      const transpiled = transpiler(newDangerfile, newPerilFileReference)
      return requireFromString(transpiled, newPerilFileReference)
    }
  }

  // User error in the path basically
  throw new Error(
    `Could not find '${request}' as a relative import from ${prefixLessParent}. Does ${localPath} exist in the repo?`
  )
}
