import * as dotenv from "dotenv"
dotenv.config()

/**
 * Pulls out an env var from either the host ENV, or a config file
 *
 * @param {string} local ENV key
 * @param {string} configName Config key
 * @returns {string}
 */
function getEnv(configName) {
    return process.env[configName]
}

function validates(keys: string[]) {
    keys.forEach((element) => {
        if (!getEnv(element)) {
            throw new Error(`Could not get Key: ${element}`)
        }
    })
}

/** Private key for the app
 *
 * To set it on heroku: heroku config:add PRIVATE_GITHUB_SIGNING_KEY="$(cat thekey.pem)"
 */
export const PRIVATE_GITHUB_SIGNING_KEY = getEnv("PRIVATE_GITHUB_SIGNING_KEY")

/**
 * The ID for the GitHub integration
 */
export const PERIL_INTEGRATION_ID = getEnv("PERIL_INTEGRATION_ID")

/** The front-end URL route  */
export const WEB_URL = getEnv("WEB_URL")

/** Postgres db URL  */
export const DATABASE_URL = getEnv("DATABASE_URL")

/** Should fetch log out to the console?  */
export const LOG_FETCH_REQUESTS = getEnv("LOG_FETCH_REQUESTS")

/** Papertrail url  */
export const PAPERTRAIL_URL = getEnv("PAPERTRAIL_URL")

/** Papertrail port  */
export const PAPERTRAIL_PORT = getEnv("PAPERTRAIL_PORT")

/** Papertrail port  */
export const PERIL_BOT_USER_ID = getEnv("PERIL_BOT_USER_ID")

// Normal validation stuff
validates(["PRIVATE_GITHUB_SIGNING_KEY", "PERIL_INTEGRATION_ID", "WEB_URL", "DATABASE_URL", "PERIL_BOT_USER_ID"])
