import { GitHubUtilsDSL } from "danger/distribution/dsl/GitHubDSL"

import { GitHubType } from "danger/distribution/platforms/GitHub"
import {
  createOrAddLabel,
  createUpdatedIssueWithIDGenerator,
  fileContentsGenerator,
} from "danger/distribution/platforms/github/GitHubUtils"
import { Platform } from "danger/distribution/platforms/platform"
import { RunType } from "./danger_run"

/**
 * When Peril is running a dangerfile for a PR we can use the default GitHub from Danger
 * however, an event like an issue comment or a user creation has no way to provide any kind of
 * feedback or DSL. To work around that we use the event provided by GitHub and provide it to Danger.
 */
export const getPerilPlatformForDSL = (type: RunType, github: GitHubType | null, githubEvent: any): Platform => {
  if (type === RunType.pr && github) {
    return github
  } else {
    const repoSlug = reposlugFromEvent(githubEvent) || "danger/peril"
    const ref = refFromEvent(githubEvent)

    // This bit of faffing ensures that as the gh utils expands we get
    // compiler errors in peril
    const utils: GitHubUtilsDSL | null = github && {
      fileContents: fileContentsGenerator(github.api.getExternalAPI(), repoSlug, ref),
      createUpdatedIssueWithID: createUpdatedIssueWithIDGenerator(github.api.getExternalAPI()),
      createOrAddLabel: createOrAddLabel(undefined as any, github.api.getExternalAPI()),
      // Not sure what this looks like for non-PR events
      fileLinks: (paths, _, __, ___) => paths.join(", "),
    }

    const nullFunc: any = () => ""
    const platform: Platform = {
      name: "Peril",
      getFileContents: github ? github.getFileContents.bind(github) : nullFunc,
      // Checks Support
      platformResultsPreMapper: () =>
        github ? github.platformResultsPreMapper && github.platformResultsPreMapper.bind(github) : nullFunc,

      // deprecated, and not used to my knowledge
      handlePostingResults: () =>
        github ? github.handlePostingResults && github.handlePostingResults.bind(github) : nullFunc,

      createComment: github ? github.createComment.bind(github) : nullFunc,
      deleteMainComment: github ? github.deleteMainComment.bind(github) : nullFunc,
      updateOrCreateComment: github ? github.updateOrCreateComment.bind(github) : nullFunc,

      createInlineComment: github ? github.createInlineComment.bind(github) : nullFunc,
      updateInlineComment: github ? github.updateInlineComment.bind(github) : nullFunc,
      deleteInlineComment: github ? github.deleteInlineComment.bind(github) : nullFunc,
      getInlineComments: () => (github ? github.getInlineComments.bind(github) : nullFunc),

      supportsCommenting: () => (github ? github.supportsCommenting.bind(github) : nullFunc),
      supportsInlineComments: () => (github ? github.supportsInlineComments.bind(github) : nullFunc),

      updateStatus: () => (github ? github.supportsInlineComments.bind(github) : nullFunc),
      getPlatformDSLRepresentation: async () => {
        return {
          ...githubEvent,
          api: github && github.api.getExternalAPI(),
          utils,
        }
      },
      getReviewInfo: () => (github ? github.getReviewInfo.bind(github) : nullFunc),
      getPlatformGitRepresentation: async () => {
        return {} as any
      },
    }
    return platform
  }
}

// Try figure the repo by guessing from the json
const reposlugFromEvent = (event: any): string | null => {
  if (event.repository && event.repository.full_name) {
    return event.repository.full_name
  }
  return null
}

// Try and figure out a sha by pulling out some json
const refFromEvent = (event: any): string => {
  // https://developer.github.com/v3/activity/events/types/#pushevent
  if (event.ref) {
    return event.ref
  }
  // https://developer.github.com/v3/activity/events/types/#statusevent
  if (event.sha) {
    return event.sha
  }
  return "master"
}
