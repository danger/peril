import * as express from "express"
import { getDB } from "../db/getDB"
import { MongoGithubInstallationModel } from "../db/mongo"
import { recordWebhookWithRequest } from "./utils/recordWebhookWithRequest"

export const recordWebhook = async (_: string, req: express.Request, __: express.Response, ___: any) => {
  const installationID = req.body.installation.id as number
  const db = getDB()
  const installation = await db.getInstallation(installationID)

  // Only deal with mongo installations, not JSON ones
  if (!installation || !("recordWebhooksUntilTime" in installation)) {
    return
  }

  const mongoInstallation = installation as MongoGithubInstallationModel
  if (!mongoInstallation.recordWebhooksUntilTime) {
    return
  }

  // If the time is in the future, then record the webhooks
  const recordExpirationDateIsFuture = mongoInstallation.recordWebhooksUntilTime > new Date()
  if (recordExpirationDateIsFuture) {
    recordWebhookWithRequest(req)
  }
}
