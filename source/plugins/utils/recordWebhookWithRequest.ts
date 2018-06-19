import * as express from "express"
import { Document, model, Schema } from "mongoose"
import { getDB } from "../../db/getDB"
import { MongoDB } from "../../db/mongo"
import { actionForWebhook } from "../../github/events/utils/actions"
import logger from "../../logger"

export interface RecordedWebhook {
  iID: number
  event: string
  eventID: string
  createdAt: Date
  json: any
}

// So that we can be sure of the model at runtime
interface RecordedWebhookModel extends RecordedWebhook, Document {}

const RecordedWebhook = model<RecordedWebhookModel>(
  "RecordedWebhook",
  new Schema({
    iID: Number,
    event: String,
    json: Schema.Types.Mixed,
    eventID: String,
    createdAt: Date,
  })
)

/** Takes any webhook and stores it into the DB */
export const recordWebhookWithRequest = async (req: express.Request) => {
  const installationID = req.body.installation.id as number
  const event = req.header("X-GitHub-Event")
  const eventID = req.header("X-GitHub-Delivery")
  const action = actionForWebhook(req.body)
  const eventName = action ? `${event}.${action}` : event

  const record: RecordedWebhook = {
    iID: installationID,
    event: eventName,
    eventID,
    createdAt: new Date(),
    json: req.body,
  }

  await RecordedWebhook.create(record)
}

/** Triggers the recording time for a specific installation to be for the next 5m */
export const setInstallationToRecord = async (installationID: number) => {
  const db = getDB() as MongoDB
  const inFiveMin = new Date(new Date().getTime() + 5 * 60000)
  logger.info(`Starting to record webhooks for ${installationID}`)

  await db.saveInstallation({
    iID: installationID,
    recordWebhooksUntilTime: inFiveMin,
    startedRecordingWebhooksTime: new Date(),
  })
}

/** Removes all recorded webhooks for a specific installation */
export const wipeAllRecordedWebhooks = async (installationID: number) => RecordedWebhook.remove({ iID: installationID })

/** Brings back a bunch of webhooks, basically everything but the json payload */
export const getRecordedWebhooksForInstallation = async (installationID: number) =>
  RecordedWebhook.find({ iID: installationID }, "iID event eventID createdAt")

/** Gets an webhook */
export const getRecordedWebhook = async (installationID: string, eventID: string) =>
  RecordedWebhook.findOne({ iID: installationID, eventID })
