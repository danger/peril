// @flow

import * as config from "config"

/**
 * Pulls out an env var from either the host ENV, or a config file
 *
 * @param {string} local ENV key
 * @param {string} configName Config key
 * @returns {string}
 */
function getEnv(local: string, configName: string): string {
  return (process.env[local]) ? process.env[local] : config.get(configName)
}

/** Private key for the app
 *
 * To set it on heroku: heroku config:add PRIVATE_GITHUB_SIGNING_KEY="$(cat thekey.pem)"
 */
export const PRIVATE_GITHUB_SIGNING_KEY = getEnv("PRIVATE_GITHUB_SIGNING_KEY", "PRIVATE_GITHUB_SIGNING_KEY")

// Normal validation stuff
if (!(PRIVATE_GITHUB_SIGNING_KEY)) {
  console.error("Missing config values")
  process.exit(1)
}

