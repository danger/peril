import { exec } from "child_process"
import { readFileSync } from "fs"
import logger from "../../logger"

const packageJSON = JSON.parse(readFileSync(__dirname + "/../../../package.json", "utf8"))

const depsToInstall = packageJSON.availablePerilRuntimeDependencies
const command = Object.keys(depsToInstall)
  .map(key => `${key}@${depsToInstall[key]}`)
  .join(" ")

exec("yarn add " + command, (err, stdout, stderr) => {
  if (err) {
    logger.error(`ERR: ${err}`)
    return
  }

  // the *entire* stdout and stderr (buffered)
  logger.info(`stdout: ${stdout}`)
  logger.info(`stderr: ${stderr}`)
})
