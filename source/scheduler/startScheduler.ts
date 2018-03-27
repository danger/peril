import { scheduleJob } from "node-schedule"

import { getDB } from "../db/getDB"
import runJob from "./runJob"

const startScheduler = async () => {
  // TODO: This will only work for JSON-based setups right now
  const db = getDB()
  const installation = await db.getInstallation(0)
  if (!installation) {
    return
  }

  // Loop through the object's properties and set up the scheduler
  for (const cronTask in installation.scheduler) {
    if (installation.scheduler.hasOwnProperty(cronTask)) {
      const dangerfiles = installation.scheduler[cronTask]
      const rules = Array.isArray(dangerfiles) ? dangerfiles : [dangerfiles]
      rules.forEach(rule => {
        scheduleJob(cronTask, () => runJob(installation, rule))
      })
    }
  }
}

export default startScheduler
