import * as child_process from "child_process"

import jsonDatabase from "../db/json"
import { DATABASE_JSON_FILE } from "../globals"

const log = console.log

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
    const plugins = installation.settings.plugins
    log("Installing: " + plugins.join(", "))

    // This will call `yarn build` which will call this, so we
    // bypass that by providing no ENV - which means `DATABASE_JSON_FILE`
    // won't exist.
    const ls = child_process.spawn("yarn", ["add", ...plugins], { env: {} })

    ls.stdout.on("data", data => log(`stdout: ${data}`))
    ls.stderr.on("data", data => log(`stderr: ${data}`))

    ls.on("close", code => {
      log(`child process exited with code ${code}`)
      process.exit(code)
    })
  } else {
    log("Not adding any plugins")
    process.exit(0)
  }
}

go()
