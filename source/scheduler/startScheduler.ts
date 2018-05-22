import { scheduleJob } from "node-schedule"

import { getDB } from "../db/getDB"
import { runTaskForInstallation } from "../tasks/startTaskScheduler"

export const startScheduler = async () => {
  // TODO: This will only work for JSON-based setups right now
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
}
