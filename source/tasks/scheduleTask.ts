import { includes, isBoolean, isNumber, isString } from "lodash"
import { fetch } from "../api/fetch"
import { PerilRunnerBootstrapJSON } from "../runner/triggerSandboxRun"
import { agenda, DangerFileTaskConfig, runDangerfileTaskName } from "./startTaskScheduler"

export const generateTaskSchedulerForInstallation = (
  installationID: number,
  sandboxSettings?: PerilRunnerBootstrapJSON
) => {
  // Awkward JS so that I can get the types set up correct

  /**
   * Run a pre-set up task
   *
   * @param taskName
   * @param time
   * @param data
   */
  const taskScheduler = async (taskName: string, time: string, data: any) => {
    const config: DangerFileTaskConfig = {
      taskName,
      data,
      installationID,
    }

    const sanitizedTime = time.replace("in ", "")
    // If you're running on your own server, you can just call agenda
    // but if you're not then you're going to need to make an API call
    if (agenda) {
      agenda.schedule(sanitizedTime, runDangerfileTaskName, config)
    } else {
      const settings = sandboxSettings!

      const input = {
        jwt: settings.perilSettings.perilJWT,
        task: runDangerfileTaskName,
        time: sanitizedTime,
        data,
      }
      const query = `mutation {
        scheduleTask(
          ${objectToGraphQLInput(input)}
        ) {
          success
        }
      }`
      // Make the API call

      await fetch(`${settings.perilSettings.perilAPIRoot}/api/graphql`, {
        method: "POST",
        body: JSON.stringify({ query }),
      })
    }
  }

  return taskScheduler
}

/**
 * Transforms a JS object into a a GraphQL object
 * @param obj the object to transform
 * @param enums an optional array of objects to treat as enums
 */
export const objectToGraphQLInput = (obj: any, enums?: string[]) => {
  let input = ""
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const element = obj[key]
      if ((includes(enums, key) && isString(element)) || isNumber(element) || isBoolean(element)) {
        input += key + `: ` + element + `, `
      } else if (isString(element)) {
        input += key + `: "` + element + `", `
      } else if (element) {
        // is probably an object at this point
        input += key + `: ` + objectToGraphQLInput(element) + ", "
      }
    }
  }
  return "{ " + input.substring(0, input.length - 2) + " }"
}
