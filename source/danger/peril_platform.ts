import { GitHub } from "danger/distribution/platforms/GitHub"
import { Platform } from "danger/distribution/platforms/platform"
import { dsl } from "./actions"

const getPerilPlatformForDSL = (type: dsl, github: GitHub | null, githubEvent: any): Platform => {
  if  (type === dsl.pr && github) {
    return github
  } else {
    const platform: Platform =  {
      createComment: github!.createComment,
      deleteMainComment: github!.deleteMainComment,
      editMainComment: github!.editMainComment,
      getPlatformDSLRepresentation: async () => {
        return githubEvent
      },
      getPlatformGitRepresentation: async () => {
        return {} as any
      },
      name: "",
      updateOrCreateComment: github!.updateOrCreateComment,
    }
    return platform
  }
}

export default getPerilPlatformForDSL
