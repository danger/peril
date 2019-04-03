import { GitHubInstallation } from "../db"
import { sendSlackMessageToInstallationID } from "../infrastructure/installationSlackMessaging"
import logger from "../logger"

import { invokeLambda } from "../api/aws/lambda"
import { PerilRunnerBootstrapJSON } from "./triggerSandboxRun"

export const runExternally = async (
  stdOUT: PerilRunnerBootstrapJSON,
  eventName: string,
  installation: GitHubInstallation
) => {
  try {
    logger.info(`  -->`)
    const call = await invokeLambda(installation.lambdaName, JSON.stringify(stdOUT))

    if (call.Status === 202) {
      logger.info(`  Running job: ${call.$response.requestId}`)

      // prettier-ignore
      const cloudWatchURL = `https:// us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#logStream:group=/aws/lambda/${installation.lambdaName};`
      logger.info(`  ${cloudWatchURL}`)
    } else {
      const errorMessage = `# Lambda call failed for ${eventName} - ${call.Status}`
      logger.error(errorMessage)
      sendSlackMessageToInstallationID(errorMessage, installation.iID)
    }
  } catch (error) {
    const errorMessage = `# Lambda call failed for ${eventName}: \n\n${error}`
    logger.error(errorMessage)
    sendSlackMessageToInstallationID(errorMessage, installation.iID)
  }
}
