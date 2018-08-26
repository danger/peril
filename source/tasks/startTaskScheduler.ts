import { MONGODB_URI } from "../globals"

import * as Agenda from "agenda"
import chalk from "chalk"
import { GitHubInstallation } from "../db"
import { getDB } from "../db/getDB"
import logger from "../logger"
import { runTask } from "./runTask"

export interface DangerFileTaskConfig {
  installationID: number
  taskName: string
  data: any
}

export let agenda: Agenda
export const runDangerfileTaskName = "runDangerfile"

const tick = chalk.bold.greenBright("✓")

export const startTaskScheduler = async () => {
  agenda = new Agenda({ db: { address: MONGODB_URI } })
  agenda.on("ready", async () => {
    await agenda.start()
    logger.info("  - " + tick + " Agenda Task Scheduler")

    agenda.define(runDangerfileTaskName, { priority: "high", concurrency: 10, lockLimit: 0 }, (job, done) => {
      const data = job.attrs.data as DangerFileTaskConfig
      logger.info(`Received a new task, ${data.taskName}`)
      done()
      startRunningTask(data)
    })
  })
}

const startRunningTask = async (data: DangerFileTaskConfig) => {
  const db = getDB()
  const installation = await db.getInstallation(data.installationID)
  if (!installation) {
    logger.error(`Could not find installation for task: ${data.taskName}`)
    return
  }

  await runTaskForInstallation(installation, data.taskName, data.data)
}

export const runTaskForInstallation = async (installation: GitHubInstallation, task: string, data: any) => {
  logger.info(`Running task ${task} for ${installation.login}:`)
  const taskDangerfiles = installation.tasks[task]
  if (!taskDangerfiles) {
    logger.error(`Could not find the task: ${task} on installation ${installation.iID}`)
    logger.error(`All tasks: ${Object.keys(installation.tasks)}`)
    return
  }

  const dangerfiles = Array.isArray(taskDangerfiles) ? taskDangerfiles : [taskDangerfiles]
  for (const dangerfile of dangerfiles) {
    const results = await runTask(task, installation, dangerfile, data)
    // There aren't results when it's process separated
    if (results) {
      if (!results.fails.length) {
        logger.info(`Task ${task} ${dangerfile} completed successfully`)
      } else {
        logger.error(`Task ${task} ${dangerfile} failed:`)
        logger.error(results.fails.map(f => f.message).join("\n"))
        logger.error(results.markdowns.join("\n"))
      }
    }
  }
}
