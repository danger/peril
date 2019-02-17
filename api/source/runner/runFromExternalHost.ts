import { GitHubInstallation } from "../db"
import { sendSlackMessageToInstallationID } from "../infrastructure/installationSlackMessaging"
import logger from "../logger"
import { invokeLambda } from "./lambdaRunner"
import { PerilRunnerBootstrapJSON } from "./triggerSandboxRun"

export const runExternally = async (
  stdOUT: PerilRunnerBootstrapJSON,
  eventName: string,
  installation: GitHubInstallation
) => {
  try {
    const call = await invokeLambda(installation.lambdaName, JSON.stringify(stdOUT))

    if (call.Status === 202) {
      // Make it easy to grab logs from
      logger.info(` Logs`)
      logger.info(`  Run a lambda job: ${Object.keys(call.$response || {})}`)
    }
  } catch (error) {
    const errorMessage = `# Hyper function call failed for ${eventName}: \n\n${error}`
    logger.error(errorMessage)
    sendSlackMessageToInstallationID(errorMessage, installation.iID)
  }
}
