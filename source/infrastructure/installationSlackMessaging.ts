import { IncomingWebhook } from "@slack/client"
import { GitHubInstallation } from "../db"
import { getDB } from "../db/getDB"
import { MongoDB } from "../db/mongo"
import * as globals from "../globals"
import logger from "../logger"

/** Protects against accidentally leaking system secrets */
export const replaceAllKeysInString = (obj: any, message: string) => {
  if (!obj) {
    return message
  }

  let mutableMessage = message
  const keys = Object.keys(obj)
  keys.forEach(key => {
    const re = new RegExp(obj[key], "g")
    mutableMessage = mutableMessage.replace(re, `[${key}]`)
  })

  return mutableMessage
}

/** Mainly just to handle the db faffing if you need it */
export const sendSlackMessageToInstallationID = async (message: string, iID: number) => {
  const db = getDB() as MongoDB
  const installation = await db.getInstallation(iID)
  if (!installation) {
    throw new Error(`Installation not found`)
  }
  return sendSlackMessageToInstallation(message, installation)
}

/**
 * Allows sending a message off to an installation
 */
export const sendSlackMessageToInstallation = async (message: string, installation: GitHubInstallation) => {
  if (installation.installationSlackUpdateWebhookURL) {
    let filteredMessage = replaceAllKeysInString(globals, message)
    filteredMessage = replaceAllKeysInString(installation.envVars, filteredMessage)

    // Doesn't matter if it fails, so long as it's logged. Shouldn't take down the server.
    try {
      const webhook = new IncomingWebhook(installation.installationSlackUpdateWebhookURL)

      await webhook.send({
        unfurl_links: false,
        username: `Peril for ${installation.login}`,
        text: filteredMessage,
      })
    } catch (error) {
      logger.error(`Sending a slack message failed for ${installation.login}`)
    }
  }
}
