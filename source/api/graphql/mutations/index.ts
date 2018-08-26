import { getDB } from "../../../db/getDB"
import { MongoDB } from "../../../db/mongo"

import { GitHubInstallation } from "../../../db"
import { sendLogsToSlackForInstallation } from "../../../infrastructure/installationSlackMessaging"
import logger from "../../../logger"
import {
  getRecordedWebhook,
  setInstallationToRecord,
  wipeAllRecordedWebhooks,
} from "../../../plugins/utils/recordWebhookWithRequest"
import { sendWebhookThroughGitHubRunner } from "../../../plugins/utils/sendWebhookThroughGitHubRunner"
import { getHyperLogs } from "../../../runner/hyper-api"
import { getDetailsFromPerilSandboxAPIJWT } from "../../../runner/sandbox/jwt"
import { agenda, runDangerfileTaskName, runTaskForInstallation } from "../../../tasks/startTaskScheduler"
import {
  GraphQLContext,
  MSGDangerfileFinished,
  MSGDangerfileLog,
  sendAsyncMessageToConnectionsWithAccessToInstallation,
  sendMessageToConnectionsWithAccessToInstallation,
} from "../../api"
import { getDetailsFromPerilJWT } from "../../auth/generate"
import { authD } from "../utils/auth"
import { getUserInstallations } from "../utils/installations"

export const mutations = {
  editInstallation: authD(async (_: any, params: any, context: GraphQLContext) => {
    const opts = params as Partial<GitHubInstallation>

    const decodedJWT = await getDetailsFromPerilJWT(context.jwt)
    const installationID = String(opts.iID)

    // Check the installation's ID is included inside the signed JWT, to verify access
    if (!decodedJWT.iss.includes(installationID)) {
      throw new Error(`You don't have access to this installation`)
    }

    // Save the changes, then trigger an update from the new repo
    const db = getDB() as MongoDB
    const updatedInstallation = await db.saveInstallation(opts)
    await db.updateInstallation(updatedInstallation.iID)
    return updatedInstallation
  }),

  makeInstallationRecord: authD(async (_: any, params: any, context: GraphQLContext) => {
    const decodedJWT = await getDetailsFromPerilJWT(context.jwt)
    const installationID = String(params.iID)

    // Check the installation's ID is included inside the signed JWT, to verify access
    if (!decodedJWT.iss.includes(installationID)) {
      throw new Error(`You don't have access to this installation`)
    }

    await wipeAllRecordedWebhooks(params.iID)
    await setInstallationToRecord(params.iID)

    // Return the modified installation
    const installations = await getUserInstallations(context.jwt)
    return installations.find(i => i.iID === params.iID)
  }),

  sendWebhookForInstallation: authD(async (_: any, params: any, context: GraphQLContext) => {
    const decodedJWT = await getDetailsFromPerilJWT(context.jwt)
    const installationID = String(params.iID)

    // Check the installation's ID is included inside the signed JWT, to verify access
    if (!decodedJWT.iss.includes(installationID)) {
      throw new Error(`You don't have access to this installation`)
    }

    const webhook = await getRecordedWebhook(params.iID, params.eventID)
    if (!webhook) {
      return null
    }

    await sendWebhookThroughGitHubRunner(webhook)
    return { success: true }
  }),

  changeEnvVarForInstallation: authD(async (_: any, params: any, context: GraphQLContext) => {
    const opts = params as { iID: number; key: string; value: string | undefined }
    const decodedJWT = await getDetailsFromPerilJWT(context.jwt)
    const installationID = String(params.iID)

    // Check the installation's ID is included inside the signed JWT, to verify access
    if (!decodedJWT.iss.includes(installationID)) {
      throw new Error(`You don't have access to this installation`)
    }

    const db = getDB() as MongoDB
    const installation = await db.getInstallation(opts.iID)
    if (!installation) {
      throw new Error(`Installation not found`)
    }

    // Make it if it doesn't exist
    const envVars = installation.envVars || {}

    // Delete it when passing null
    if (!opts.value) {
      delete envVars[opts.key]
    } else {
      // Add/overwrite when there's a value
      envVars[opts.key] = opts.value
    }

    // Just update the env vars
    await db.saveInstallation({ iID: opts.iID, envVars })
    return envVars
  }),

  runTask: authD(async (_: any, params: any, context: GraphQLContext) => {
    const opts = params as { iID: number; task: string; data: any }
    const decodedJWT = await getDetailsFromPerilJWT(context.jwt)
    const installationID = String(params.iID)

    // Check the installation's ID is included inside the signed JWT, to verify access
    if (!decodedJWT.iss.includes(installationID)) {
      throw new Error(`You don't have access to this installation`)
    }

    const db = getDB() as MongoDB
    const installation = await db.getInstallation(opts.iID)
    if (!installation) {
      throw new Error(`Installation not found`)
    }

    if (!installation.tasks[opts.task]) {
      throw new Error(`Task not found on installation`)
    }

    await runTaskForInstallation(installation, opts.task, opts.data || {})

    return { success: true }
  }),

  scheduleTask: async (_: any, params: any, __: GraphQLContext) => {
    const opts = params as { task: string; time: string; data: string; jwt: string }
    const decodedJWT = await getDetailsFromPerilSandboxAPIJWT(opts.jwt)

    const db = getDB() as MongoDB
    const installation = await db.getInstallation(parseInt(decodedJWT.iss[0]!, 10))
    if (!installation) {
      throw new Error(`Installation not found from JWT`)
    }

    if (!installation.tasks[opts.task]) {
      throw new Error(`Task not found on installation, found ${Object.keys(installation.tasks)}`)
    }

    // see createPerilSandboxAPIJWT
    if (!decodedJWT.data.actions || !decodedJWT.data.actions.includes("scheduleTask")) {
      throw new Error(`This JWT does not have the credentials to schedule a task`)
    }

    // We need to attach an installation so we can look it up on the
    // running aspect
    const schedulerConfig = {
      data: JSON.parse(opts.data),
      installationID: installation.iID,
      taskName: opts.task,
    }

    agenda.schedule(opts.time, runDangerfileTaskName, schedulerConfig)
    return { success: true }
  },

  dangerfileFinished: async (_: any, params: any, __: GraphQLContext) => {
    const opts = params as { dangerfiles: string[]; time: number; jwt: string; hyperCallID: string; name: string }
    const decodedJWT = await getDetailsFromPerilSandboxAPIJWT(opts.jwt)

    const db = getDB() as MongoDB
    const installation = await db.getInstallation(parseInt(decodedJWT.iss[0]!, 10))
    if (!installation) {
      throw new Error(`Installation not found from JWT`)
    }

    if (!decodedJWT.data.actions || !decodedJWT.data.actions.includes("dangerfileFinished")) {
      throw new Error(`JWT did not have access to run dangerfileFinished`)
    }

    const message: MSGDangerfileFinished = {
      event: opts.name,
      filenames: opts.dangerfiles,
      time: opts.time,
      action: "finished",
    }

    sendMessageToConnectionsWithAccessToInstallation(installation.iID, message)

    // TODO: Store the time in some kind of per-installation analytics document

    // Wait 2 seconds for the container to finish
    setTimeout(async () => {
      let dangerfileLog: MSGDangerfileLog | undefined

      // Get Hyper logs
      const getLogs = async () => {
        let logs = null
        try {
          logs = await getHyperLogs(opts.hyperCallID)
        } catch (error) {
          logger.error(`Requesting the hyper logs for ${installation.iID} with callID ${opts.hyperCallID} - ${error}`)
          return
        }
        const logMessage: MSGDangerfileLog = {
          event: opts.name,
          action: "log",
          filenames: opts.dangerfiles,
          log: logs as string,
        }
        return logMessage
      }

      // If you have a connected slack webhook, then always grab the logs
      // and store the value somewhere where the websocket to admin connections
      // can also read.
      if (installation.installationSlackUpdateWebhookURL) {
        dangerfileLog = await getLogs()
        sendLogsToSlackForInstallation("Received logs from Peril", dangerfileLog!, installation)
      }

      // Callback inside is lazy loaded and only called if there are people
      // in the dashboard
      sendAsyncMessageToConnectionsWithAccessToInstallation(installation.iID, async spark => {
        // If the slack trigger above didn't grab the logs, then re-grab them.
        if (!dangerfileLog) {
          dangerfileLog = await getLogs()
        }
        spark.write(dangerfileLog)
      })
    }, 2000)

    return { success: true }
  },
}
