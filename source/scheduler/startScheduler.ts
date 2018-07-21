import { scheduleJob } from "node-schedule"

import { getDB } from "../db/getDB"
import { runTaskForInstallation } from "../tasks/startTaskScheduler"

export const startScheduler = async () => {
  // TODO: This doesn't handle the case when someone adds a new scheduler and the server hasn't been restarted
  setTimeout(runSchedule, 5000)
}

export const runSchedule = async () => {
  const db = getDB()
  const installations = await db.getSchedulableInstallations()

  installations.forEach(installation => {
    if (Object.keys(installation.scheduler)) {
      // Loop through the object's properties and set up the scheduler
      for (const cronTask in installation.scheduler) {
        if (installation.scheduler.hasOwnProperty(cronTask)) {
          const task = installation.scheduler[cronTask]
          scheduleJob(cronTask, () => runTaskForInstallation(installation, task, {}))
        }
      }
    }
  })
}
