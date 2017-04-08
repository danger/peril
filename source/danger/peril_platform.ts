import { GitHub } from "danger/distribution/platforms/GitHub"
import { Platform } from "danger/distribution/platforms/platform"
import { dsl } from "./danger_run"

const getPerilPlatformForDSL = (type: dsl, github: GitHub | null, githubEvent: any): Platform => {
  if  (type === dsl.pr && github) {
    return github
  } else {
    const nullFunc: any = () => ""

    const platform: Platform =  {
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
      updateOrCreateComment: github!.updateOrCreateComment,
    }
    return platform
  }
}

export default getPerilPlatformForDSL
