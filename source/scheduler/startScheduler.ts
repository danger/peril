import { scheduleJob } from "node-schedule"

import { getDB } from "../db/getDB"
import { runTaskForInstallation } from "../tasks/startTaskScheduler"

export const startScheduler = () => {
  // TODO: There is an inherent disconnect here. The setup function on a db, is async, but we *want* a sync API
  // to the db that may call this. So, instead we add a 5s delay to setting up the scheduler. Probably enough
  // time for the installation to be set up.

  // TODO: This does not iterate through all the installations

  // TODO: This doesn't handle the case when someone adds a new scheduler and the server hasn't been restarted
  setTimeout(async () => {
    const db = getDB()
    const installation = await db.getInstallation(0)
    if (!installation) {
      return
    }

    // Loop through the object's properties and set up the scheduler
    for (const cronTask in installation.scheduler) {
      if (installation.scheduler.hasOwnProperty(cronTask)) {
        const task = installation.scheduler[cronTask]
        scheduleJob(cronTask, () => runTaskForInstallation(installation, task, {}))
      }
    }
  }, 5000)
}
