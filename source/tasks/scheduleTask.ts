import { agenda, DangerFileTaskConfig, runDangerfileTaskName } from "./startTaskScheduler"

export const generateTaskSchedulerForInstallation = installationID => {
  // Awkward JS so that I can get the types set up correct

  /**
   * Run a pre-set up task
   *
   * @param taskName
   * @param time
   * @param data
   */
  const taskScheduler = (taskName: string, time: string, data: any) => {
    const config: DangerFileTaskConfig = {
      taskName,
      data,
      installationID,
    }

    const sanitizedTime = time.replace("in ", "")
    agenda.schedule(sanitizedTime, runDangerfileTaskName, config)
  }

  return taskScheduler
}
