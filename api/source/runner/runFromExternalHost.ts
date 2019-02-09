import { InstallationToRun } from "../danger/danger_runner"
import { HYPER_FUNC_NAME } from "../globals"
import { sendSlackMessageToInstallationID } from "../infrastructure/installationSlackMessaging"
import logger from "../logger"
import { callHyperFunction } from "./hyper-api"
import { PerilRunnerBootstrapJSON } from "./triggerSandboxRun"

export const runExternally = async (
  stdOUT: PerilRunnerBootstrapJSON,
  eventName: string,
  installation: InstallationToRun
) => {
  try {
    const call = await callHyperFunction(stdOUT)
    const callID = JSON.parse(call).CallId
    if (callID) {
      // Make it easy to grab logs from
      logger.info(` Logs`)
      logger.info(` summary: hyper func logs --tail=all --callid ${callID} ${HYPER_FUNC_NAME}`)
      logger.info(`  stdout: hyper func get ${callID}`)
    }
  } catch (error) {
    const errorMessage = `# Hyper function call failed for ${eventName}: \n\n${error}`
    logger.error(errorMessage)
    sendSlackMessageToInstallationID(errorMessage, installation.iID)
  }
}
