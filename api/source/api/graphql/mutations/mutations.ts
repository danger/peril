import { getDB } from "../../../db/getDB"
import { MongoDB } from "../../../db/mongo"

import { GitHubInstallation } from "../../../db"
import logger from "../../../logger"
import {
  getRecordedWebhook,
  setInstallationToRecord,
  wipeAllRecordedWebhooks,
} from "../../../plugins/utils/recordWebhookWithRequest"
import { sendWebhookThroughGitHubRunner } from "../../../plugins/utils/sendWebhookThroughGitHubRunner"
import { getDetailsFromPerilSandboxAPIJWT } from "../../../runner/sandbox/jwt"
import { runTaskForInstallation, triggerAFutureDangerRun } from "../../../tasks/startTaskScheduler"
import { GraphQLContext, MSGDangerfileFinished, sendMessageToConnectionsWithAccessToInstallation } from "../../api"
import { getDetailsFromPerilJWT } from "../../auth/generate"
import { createLambdaFunctionForInstallation } from "../../aws/lambda"
import { authD } from "../utils/auth"
import { getUserInstallations } from "../utils/installations"

const confirmAccessToJWT = async (iID: number, jwt: string) => {
  if (!iID) {
    throw new Error(`No installation ID given`)
  }
  if (!jwt) {
    throw new Error(`No JWT given`)
  }

  const decodedJWT = await getDetailsFromPerilJWT(jwt)
  const installationID = String(iID)

  // Check the installation's ID is included inside the signed JWT, to verify access
  if (!decodedJWT.iss.includes(installationID)) {
    throw new Error(`You don't have access to this installation`)
  }
}

type PartialInstallation = Partial<GitHubInstallation> & { iID: number }

// const dangerOrgStagingInstallationID = 135226

export const mutations = {
  convertPartialInstallation: authD(async (_: any, params: any, context: GraphQLContext) => {
    const opts = params as PartialInstallation
    await confirmAccessToJWT(opts.iID, context.jwt)
    const decodedJWT = await getDetailsFromPerilJWT(context.jwt)

    if (decodedJWT.data.user.name !== "orta") {
      return { error: { description: `Sorry folks, only Orta can create a new installation.` } }
    }

    logger.info(`mutation: convertPartialInstallation ${opts.iID}`)

    // Save the changes, then trigger an update from the new repo
    const db = getDB() as MongoDB
    const updatedInstallation = await db.saveInstallation(opts)
    try {
      // Try run the mongo updater, if this fails then it will raise
      await db.updateInstallation(updatedInstallation.iID)

      // OK, that worked, let's set it up
      const lambda = await createLambdaFunctionForInstallation(updatedInstallation.login)
      // Set the lambda function for the server
      await db.saveInstallation({ iID: updatedInstallation.iID, lambdaName: lambda.name })

      return updatedInstallation
    } catch (error) {
      // This is basically the difference between `convertPartialInstallation` and `editInstallation`
      //
      // Reset the perilSettingsJSONURL so that the next one starts from scratch.
      await db.saveInstallation({ perilSettingsJSONURL: undefined })
      return {
        error: { description: error.message },
      }
    }
  }),

  editInstallation: authD(async (_: any, params: any, context: GraphQLContext) => {
    const opts = params as PartialInstallation
    await confirmAccessToJWT(opts.iID, context.jwt)

    logger.info(`mutation: editInstallation ${opts.iID}`)

    // Save the changes, then trigger an update from the new repo
    const db = getDB() as MongoDB
    const updatedInstallation = await db.saveInstallation(opts)
    try {
      await db.updateInstallation(updatedInstallation.iID)
      return updatedInstallation
    } catch (error) {
      return {
        error: { description: error.message },
      }
    }
  }),

  makeInstallationRecord: authD(async (_: any, params: any, context: GraphQLContext) => {
    await confirmAccessToJWT(params.iID, context.jwt)

    logger.info(`mutation: makeInstallationRecord ${params.iID}`)

    await wipeAllRecordedWebhooks(params.iID)
    await setInstallationToRecord(params.iID)

    // Return the modified installation
    const installations = await getUserInstallations(context.jwt)
    return installations.find(i => i.iID === params.iID)
  }),

  sendWebhookForInstallation: authD(async (_: any, params: any, context: GraphQLContext) => {
    await confirmAccessToJWT(params.iID, context.jwt)
    logger.info(`mutation: sendWebhookForInstallation ${params.iiD} webhook ${params.eventID}`)

    const webhook = await getRecordedWebhook(params.iID, params.eventID)
    if (!webhook) {
      return null
    }

    await sendWebhookThroughGitHubRunner(webhook)
    return webhook
  }),

  changeEnvVarForInstallation: authD(async (_: any, params: any, context: GraphQLContext) => {
    const opts = params as { iID: number; key: string; value: string | undefined }
    await confirmAccessToJWT(opts.iID, context.jwt)

    const db = getDB() as MongoDB
    const installation = await db.getInstallation(opts.iID)
    if (!installation) {
      throw new Error(`Installation not found`)
    }

    logger.info(`mutation: changeEnvVarForInstallation ${opts.iID} edited ${opts.key}`)

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
    await confirmAccessToJWT(opts.iID, context.jwt)

    const db = getDB() as MongoDB
    const installation = await db.getInstallation(opts.iID)
    if (!installation) {
      throw new Error(`Installation not found`)
    }

    if (!installation.tasks[opts.task]) {
      throw new Error(`Task not found on installation`)
    }

    logger.info(`mutation: runTask ${opts.iID} task ${opts.task}`)
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

    logger.info(`mutation: scheduleTask ${installation.iID} task ${opts.task} ${opts.time}`)

    // We need to attach an installation so we can look it up on the
    // running aspect.
    const schedulerConfig = {
      data: JSON.parse(opts.data),
      installationID: installation.iID,
      taskName: opts.task,
    }

    triggerAFutureDangerRun(opts.time, schedulerConfig)
    return { success: true }
  },

  createNewRepo: async (_: any, params: any, __: GraphQLContext) => {
    // # Triggers a message to admins in the dashboard, and prepares to grab the logs
    // createNewRepo(iID: Int!, repoName: String!): MutationWithRepo
  },
  requestNewRepo: async (_: any, params: any, __: GraphQLContext) => {
    // # request a PR with Peril settings
    // requestNewRepo(iID: Int!, repoName: String!, useTypeScript: Boolean!, setupTests: Boolean!, isPublic: Boolean!): MutationWithRepo
  },

  dangerfileFinished: async (_: any, params: any, __: GraphQLContext) => {
    const opts = params as {
      dangerfiles: string[]
      time: number
      jwt: string
      hyperCallID: string | undefined
      name: string
    }
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

    // TODO: Store the time in some kind of per-installation analytics document?

    //  TODO: Bring back live logs?

    // // Calls can come from outside hyper now
    // const hyperCallID = opts.hyperCallID
    // if (hyperCallID) {
    //   // Wait 2 seconds for the container to finish
    //   setTimeout(async () => {
    //     let dangerfileLog: MSGDangerfileLog | undefined
    //     // Get Hyper logs
    //     const getLogs = async () => {
    //       let logs = null
    //       try {
    //         logs =  "" // await getHyperLogs(hyperCallID)
    //       } catch (error) {
    //         logger.error(`Requesting the hyper logs for ${installation.iID} with callID ${hyperCallID} - ${error}`)
    //         return
    //       }
    //       const logMessage: MSGDangerfileLog = {
    //         event: opts.name,
    //         action: "log",
    //         filenames: opts.dangerfiles,
    //         log: logs as string,
    //       }
    //       return logMessage
    //     }

    //     // If you have a connected slack webhook, then always grab the logs
    //     // and store the value somewhere where the websocket to admin connections
    //     // can also read.
    //     if (installation.installationSlackUpdateWebhookURL) {
    //       dangerfileLog = await getLogs()
    //       sendLogsToSlackForInstallation("Received logs", dangerfileLog!, installation)
    //     }
    //     // Callback inside is lazy loaded and only called if there are people
    //     // in the dashboard
    //     sendAsyncMessageToConnectionsWithAccessToInstallation(installation.iID, async spark => {
    //       // If the slack trigger above didn't grab the logs, then re-grab them.
    //       if (!dangerfileLog) {
    //         dangerfileLog = await getLogs()
    //       }
    //       spark.write(dangerfileLog)
    //     })
    //   }, 2000)
    // }

    return { success: true }
  },
}
