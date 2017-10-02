import { scheduleJob } from "node-schedule"

import db from "../db/getDB"
import runJob from "./runJob"

const startScheduler = async () => {
  // TODO: This will only work for JSON-based setups right now
  const installation = await db.getInstallation(0)
  if (!installation) {
    return
  }

  // Loop through the object's properties and set up the scheduler
  for (const cronTask in installation.scheduler) {
    if (installation.scheduler.hasOwnProperty(cronTask)) {
      const rules = installation.scheduler[cronTask]
      scheduleJob(cronTask, () => runJob(installation, rules))
    }
  }
}

export default startScheduler
