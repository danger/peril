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
    const nullFunc: any = () => ""

    const platform: Platform = {
      createComment: github ? github.createComment : nullFunc,
      deleteMainComment: github ? github.deleteMainComment : nullFunc,
      editMainComment: github ? github.editMainComment : nullFunc,
      getPlatformDSLRepresentation: async () => {
        return githubEvent
      },
      getPlatformGitRepresentation: async () => {
        return {} as any
      },
      name: "",
      updateOrCreateComment: github ? github.updateOrCreateComment : nullFunc,
      updateStatus: () => Promise.resolve(true),
    }
    return platform
  }
}

export default getPerilPlatformForDSL
