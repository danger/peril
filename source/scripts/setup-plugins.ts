import * as child_process from "child_process"

import jsonDatabase from "../db/json"
import { DATABASE_JSON_FILE } from "../globals"

const go = async () => {
  // Download settings
  const db = jsonDatabase(DATABASE_JSON_FILE)
  await db.setup()

  const installation = await db.getInstallation(0)
  if (!installation) {
    return
  }
  // Look for plugins
  if (installation.settings.plugins && installation.settings.plugins.length !== 0) {
    const plugins = installation.settings.plugins.join(" ")
    console.log("Installing: " + plugins) // tslint:disable-line
    // Install them with yarn
    child_process.execSync("yarn install " + plugins)
  } else {
    console.log("Not adding any plugins") // tslint:disable-line
  }
}

go()
