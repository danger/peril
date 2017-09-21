import { GitHubUtilsDSL } from "danger/distribution/dsl/GitHubDSL"
import { GitHub } from "danger/distribution/platforms/GitHub"

import { Platform } from "danger/distribution/platforms/platform"
import { dsl } from "./danger_run"

/**
 * When Peril is running a dangerfile for a PR we can use the default GitHub from Danger
 * however, an event like an issue comment or a user creation has no way to provide any kind of
 * feedback or DSL. To work around that we use the event provided by GitHub and provide it to Danger.
 */
const getPerilPlatformForDSL = (type: dsl, github: GitHub | null, githubEvent: any): Platform => {
  if (type === dsl.pr && github) {
    return github
  } else {
    // This bit of faffing ensures that as the gh utils expands we get
    // compiler errors in peril
    const utils: GitHubUtilsDSL | null = github && {
      fileContents: github && github.api.fileContents,
      // Not sure what this looks like for non-PR events
      fileLinks: (paths, useBasename, repoSlug, branch) => paths.join(", "),
    }

    const nullFunc: any = () => ""
    const platform: Platform | any = {
      createComment: github ? github.createComment.bind(github) : nullFunc,
      deleteMainComment: github ? github.deleteMainComment.bind(github) : nullFunc,
      getPlatformDSLRepresentation: async () => {
        return {
          ...githubEvent,
          api: github && github.api.getExternalAPI(),
          utils,
        }
      },
      getPlatformGitRepresentation: async () => {
        return {} as any
      },
      name: "Peril",
      updateOrCreateComment: github ? github.updateOrCreateComment.bind(github) : nullFunc,
      updateStatus: () => Promise.resolve(true),
    }
    return platform
  }
}

export default getPerilPlatformForDSL
