import { graphqlAPI } from "../api/graphql/api"
import { gql } from "../api/graphql/gql"
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
      const mutationData = JSON.stringify(data).replace(/\"/g, '\\"')
      const query = gql`
      mutation {
        scheduleTask(
          jwt: "${settings.perilSettings.perilJWT}",
          task: "${taskName}",
          time: "${sanitizedTime}",
          data: "${mutationData}"
        ) {
          success
        }
      }`

      // Make the API call
      await graphqlAPI(settings.perilSettings.perilAPIRoot, query)
    }
  }

  return taskScheduler
}
