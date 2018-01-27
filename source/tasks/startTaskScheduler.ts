import { MONGODB_URI, PERIL_WEBHOOK_SECRET, PUBLIC_FACING_API } from "../globals"

import * as Agenda from "agenda"
import db from "../db/getDB"
import logger from "../logger"
import { runTask } from "./runTask"

export interface DangerFileTaskConfig {
  installationID: number
  taskName: string
  data: any
}

export let agenda: Agenda
export const runDangerfileTaskName = "runDangerfile"

export const startTaskScheduler = async () => {
  agenda = new Agenda({ db: { address: MONGODB_URI } })
  agenda.on("ready", () => {
    logger.info("Task runner ready")
    agenda.start()
  })

  agenda.define(runDangerfileTaskName, async (job, done) => {
    const data = job.attrs.data as DangerFileTaskConfig
    logger.info(`Recieved a new task, ${data.taskName}`)

    const installation = await db.getInstallation(data.installationID)
    if (!installation) {
      logger.error(`Could not find installation for task: ${data.taskName}`)
      return
    }

    const taskString = installation.tasks[data.taskName]
    if (!taskString) {
      logger.error(`Could not find the task: ${data.taskName} on installation ${data.installationID}`)
      return
    }

    runTask(installation, taskString, data.data)
  })
}
