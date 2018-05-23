import { getDB } from "../../../db/getDB"
import { MongoDB } from "../../../db/mongo"
import {
  getRecordedWebhook,
  setInstallationToRecord,
  wipeAllRecordedWebhooks,
} from "../../../plugins/utils/recordWebhookWithRequest"
import { sendWebhookThroughGitHubRunner } from "../../../plugins/utils/sendWebhookThroughGitHubRunner"
import { getDetailsFromPerilSandboxAPIJWT } from "../../../runner/sandbox/jwt"
import { agenda, runTaskForInstallation } from "../../../tasks/startTaskScheduler"
import { GraphQLContext } from "../../api"
import { getDetailsFromPerilJWT } from "../../auth/generate"
import { authD } from "../utils/auth"
import { getUserInstallations } from "../utils/installations"

export const mutations = {
  editInstallation: authD(async (_: any, params: any, context: GraphQLContext) => {
    const decodedJWT = await getDetailsFromPerilJWT(context.jwt)
    const installationID = String(params.iID)

    // Check the installation's ID is included inside the signed JWT, to verify access
    if (!decodedJWT.iss.includes(installationID)) {
      throw new Error(`You don't have access to this installation`)
    }

    // Save the changes, then trigger an update from the new repo
    const db = getDB() as MongoDB
    const updatedInstallation = await db.saveInstallation(params)
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
    return webhook
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
    const opts = params as { task: string; time: string; data: any; jwt: string }
    const decodedJWT = await getDetailsFromPerilSandboxAPIJWT(opts.jwt)

    const db = getDB() as MongoDB
    const installation = await db.getInstallation(parseInt(decodedJWT.iss[0]!, 10))
    if (!installation) {
      throw new Error(`Installation not found from JWT`)
    }

    if (!installation.tasks[opts.task]) {
      throw new Error(`Task not found on installation`)
    }

    // see createPerilSandboxAPIJWT
    if (!opts.data.actions || opts.data.actions.includes("scheduleTasks")) {
      throw new Error(`This JWT does not have the credentials to schedule a task`)
    }

    agenda.schedule(opts.time, opts.task, opts.data)
    return { success: true }
  },
}
