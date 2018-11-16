import { spawn, spawnSync } from "child_process"
import debug from "debug"
import { InstallationToRun } from "../danger/danger_runner"
import { sendSlackMessageToInstallationID } from "../infrastructure/installationSlackMessaging"
import { PerilRunnerBootstrapJSON } from "./triggerSandboxRun"

const d = debug("runFromSameHost")

export const runFromSameHost = async (
  stdOUT: PerilRunnerBootstrapJSON,
  // tslint:disable-next-line:variable-name
  _eventName: string,
  installation: InstallationToRun
) => {
  const which = spawnSync("/usr/bin/which", ["node"])
  const nodePath = which.stdout.toString().trim()

  const path = "out/runner/index.js"
  const child = spawn(nodePath, [path], { env: { ...process.env, ...stdOUT.perilSettings.envVars } })

  // Pipe in the STDOUT
  child.stdin.write(JSON.stringify(stdOUT))
  child.stdin.end()

  let allLogs = ""
  child.stdout.on("data", async data => {
    const stdout = data.toString()
    allLogs += stdout
    d(stdout)
  })

  child.stderr.on("data", data => {
    const stderr = data.toString()
    allLogs += stderr
    d(stderr)
  })

  child.on("close", async code => {
    d(`child process exited with code ${code}`)
    if (code) {
      sendSlackMessageToInstallationID(allLogs, installation.iID)
    }
  })
}
