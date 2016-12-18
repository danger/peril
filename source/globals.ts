import * as config from "config"

/**
 * Pulls out an env var from either the host ENV, or a config file
 *
 * @param {string} local ENV key
 * @param {string} configName Config key
 * @returns {string}
 */
function getEnv(configName) {
    if (process.env[configName]) {
        return process.env[configName];
    }
    if (config.has(configName)) {
        const devKey = config.get(configName);
        if (devKey.constructor === Array) {
            return devKey.join("\n");
        }
    }
    return null;
}

/** Private key for the app
 *
 * To set it on heroku: heroku config:add PRIVATE_GITHUB_SIGNING_KEY="$(cat thekey.pem)"
 */
export const PRIVATE_GITHUB_SIGNING_KEY = getEnv("PRIVATE_GITHUB_SIGNING_KEY")

/**
 * The ID for the GitHub integration
 */
export const PERIL_INTEGATION_ID = getEnv("PERIL_INTEGATION_ID")

/** The front-end URL route  */
export const WEB_URL = getEnv("WEB_URL")

/** Mongo db URL  */
export const DB_URL = getEnv("DB_URL")

/** Mongo db URL  */
export const LOG_FETCH_REQUESTS = getEnv("LOG_FETCH_REQUESTS")


// Normal validation stuff
if (!PRIVATE_GITHUB_SIGNING_KEY && !PERIL_INTEGATION_ID && !WEB_URL && !DB_URL) {
  console.error("Missing config values")
  process.exit(1)
}
