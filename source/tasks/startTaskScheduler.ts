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

  const runTasker = (job: any, done: any) => {
    const data = job.attrs.data as DangerFileTaskConfig
    logger.info(`Received a new task, ${data.taskName}`)
    done()
    startRunningTask(data)
  }

  agenda.define(runDangerfileTaskName, { priority: "high", concurrency: 10, lockLimit: 0, lockLifetime: 10 }, runTasker)

  agenda.on("error", err => {
    logger.error("Error with Agenda", err)
  })

  await agenda.start()

  logger.info("  - " + tick + " Agenda Task Scheduler")

  // TODO: This is unresolved async potentially
  const db = getDB()
  const installations = await db.getSchedulableInstallations()
  logger.info("  - " + tick + ` Setup ${installations.length} installations with schedulers`)

  installations.forEach(installation => {
    if (installation && Object.keys(installation.scheduler)) {
      // Loop through the object's properties and set up the scheduler
      for (const cronTask in installation.scheduler) {
        if (installation.scheduler.hasOwnProperty(cronTask)) {
          // Uses the same task definition as above
          const config: DangerFileTaskConfig = {
            taskName: installation.scheduler[cronTask],
            installationID: installation.iID,
            data: {},
          }
          const taskName = `${installation.login}-${cronTask}-${config.taskName}-${runDangerfileTaskName}`
          agenda.define(taskName, runTasker)
          agenda.every(cronTask, taskName, config)
        }
      }
    }
  })
}

/**
 * Sets up and verifies the installation
 */
const startRunningTask = async (data: DangerFileTaskConfig) => {
  const db = getDB()
  const installation = await db.getInstallation(data.installationID)
  if (!installation) {
    logger.error(`Could not find installation for task: ${data.taskName}`)
    return
  }

  await runTaskForInstallation(installation, data.taskName, data.data)
}

/**
 * Runs a dangerfile for a particular task name
 */
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
