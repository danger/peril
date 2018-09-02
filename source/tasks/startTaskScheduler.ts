import { MONGODB_URI } from "../globals"

import * as Agenda from "agenda"
import chalk from "chalk"
import { GitHubInstallation, InstallationSchedulerKeys } from "../db"
import { getDB } from "../db/getDB"
import logger from "../logger"
import { runTask } from "./runTask"

/** The shape of data sent through peril.runTask in the db */
export interface DangerFileTaskConfig {
  installationID: number
  taskName: string
  data: any
}

/** The singleton agenda instance */
let agenda: Agenda
/** The runTask name */
export const runDangerfileTaskName = "runDangerfile"

const tick = chalk.bold.greenBright("✓")

export const startTaskScheduler = async () => {
  agenda = new Agenda({ db: { address: MONGODB_URI }, processEvery: "3 minutes" }) // 5s

  agenda.on("error", err => {
    logger.error("Error with Agenda", err)
  })

  // The define for running a dangerfile
  setupForRunTask(agenda)

  agenda.on("ready", () => {
    logger.info("  - " + tick + " Agenda Task Scheduler")
    agenda.start()
    // Support running one-off tasks in the future

    // Defines the Agenda scheduled job, and sets up an agenda.every to trigger it
    // The extra faff is so that we can be sure about all keys being `InstallationSchedulerKeys`
    const every = (key: InstallationSchedulerKeys, interval: string) => {
      agenda.define(key, runSchedulerFunc(key))
      agenda.every(interval, key)
    }

    // // Defines the Agenda scheduled job, and sets up an agenda.every to trigger it
    // // But supports passing in a particular timezone, given that you likely have to
    // // faff by using the cron syntax instead of human-readable interval
    const everyTZ = (key: InstallationSchedulerKeys, interval: string, timezone: string) => {
      agenda.define(key, runSchedulerFunc(key))
      agenda.every(interval, key, {}, { timezone })
    }

    // Hourly
    every("hourly", "1 hour")

    // Daily
    every("daily", "1 day")

    // Weekly
    every("weekly", "1 week")

    // Agenda uses the "cron" library,
    // You can see how that works with https://github.com/kelektiv/node-cron#cron-ranges
    // NOTE, crontab skips seconds and the "cron" module doesn't
    // https://crontab.guru/#0_9_*_*_1

    // Weekday Morning for Artsy
    everyTZ("monday-morning-est", "0 0 9 * * 1", "America/New_York")
    everyTZ("tuesday-morning-est", "0 0 9 * * 2", "America/New_York")
    everyTZ("wednesday-morning-est", "0 0 9 * * 3", "America/New_York")
    everyTZ("thursday-morning-est", "0 0 9 * * 4", "America/New_York")
    everyTZ("friday-morning-est", "0 0 9 * * 5", "America/New_York")

    // This is the generic env runtime, it takes in a key from the above keys and
    // grabs all the installations which have that, then run their tasks async
    const runSchedulerFunc = (key: InstallationSchedulerKeys) => (_: any) => {
      // This works on both JSON based, and mongo based DBs
      const db = getDB()
      // Avoiding declaring this code as async
      db.getSchedulableInstallationsWithKey(key).then(installations => {
        const validInstallations = installations.filter(installation => {
          if (!installation || !installation.scheduler) {
            return false
          }
          // Yeah, they have a scheduler, but we need to verify that key - the JSON
          // version of an installation is always returned, which could not have the key we're looking for
          if (!Object.keys(installation.scheduler).includes(key)) {
            return false
          }

          // Cool
          return true
        })

        if (validInstallations.length) {
          logger.info(`Running the ${key} scheduler for ${validInstallations.length} installs`)
        } else {
          logger.info(`Skipping scheduler ${key} because nothing is subscribed`)
        }

        // Run the related task for the scheduler
        validInstallations.forEach(installation => {
          const taskName = installation.scheduler[key]!
          runTaskForInstallation(installation, taskName, {})
        })
      })
    }
  })
}

/** Makes sure that we can handle `peril.runTask` functions being called */
export const setupForRunTask = (agendaLocal: Agenda) =>
  agendaLocal.define(runDangerfileTaskName, (job, done) => {
    // soon: job.remove()
    const data = job.attrs.data as DangerFileTaskConfig
    logger.info(`Received a new task, ${data.taskName}`)
    done()

    const db = getDB()
    db.getInstallation(data.installationID).then(installation => {
      if (!installation) {
        logger.error(`Could not find installation for task: ${data.taskName}`)
        return
      }
      runTaskForInstallation(installation, data.taskName, data.data)
    })
  })

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

  // Let tasks also be an array if you want, sure, why not?
  const dangerfiles = Array.isArray(taskDangerfiles) ? taskDangerfiles : [taskDangerfiles]
  for (const dangerfile of dangerfiles) {
    const results = await runTask(task, installation, dangerfiles, data)
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

export const hasAgendaInRuntime = () => !!agenda

export const triggerAFutureDangerRun = (when: string, config: DangerFileTaskConfig) =>
  agenda.schedule(when, runDangerfileTaskName, config)
