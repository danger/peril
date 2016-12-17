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
  if (process.env[local]) { return process.env[local] }
  const devKey: any = config.get(configName)
  if(devKey.constructor === Array ) {
    return devKey.join("\n")
  }
  return devKey;
}

/** Private key for the app
 *
 * To set it on heroku: heroku config:add PRIVATE_GITHUB_SIGNING_KEY="$(cat thekey.pem)"
 */
export const PRIVATE_GITHUB_SIGNING_KEY = getEnv("PRIVATE_GITHUB_SIGNING_KEY", "PRIVATE_GITHUB_SIGNING_KEY")

/**
 * The ID for the GitHub integration
 */
export const PERIL_INTEGATION_ID = getEnv("PERIL_INTEGATION_ID", "PERIL_INTEGATION_ID")

// Normal validation stuff
if (!PRIVATE_GITHUB_SIGNING_KEY && !PERIL_INTEGATION_ID ) {
  console.error("Missing config values")
  process.exit(1)
}
