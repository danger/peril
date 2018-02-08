const originalRequire = require
// @ts-ignore
require = path => {
  // tslint:disable-next-line:no-console
  console.log("Req sts: ", path)
  return originalRequire(path)
}

import { MONGODB_URI } from "../globals"

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
      logger.error(`All tasks: ${Object.keys(installation.tasks)}`)
      return
    }

    const results = await runTask(installation, taskString, data.data)
    // There aren't results when it's process separated
    if (results) {
      if (!results.fails.length) {
        logger.info("Task completed successfully")
      } else {
        logger.error("Task failed:")
        logger.error(results.fails.map(f => f.message).join("\n"))
        logger.error(results.markdowns.join("\n"))
      }
    }
    done()
  })
}
