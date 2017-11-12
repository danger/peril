import * as dotenv from "dotenv"
dotenv.config({ path: ".env." + process.env.NODE_ENV })

/**
 * Pulls out an env var from either the host ENV, or a config file
 *
 * @param {string} local ENV key
 * @param {string} configName Config key
 * @returns {string}
 */
function getEnv(configName): string {
  return process.env[configName]
}

function validates(keys: string[]) {
  keys.forEach(element => {
    if (!getEnv(element)) {
      throw new Error(`Could not get Key: ${element}`)
    }
  })
}

/** Private key for the app
 *
 * To set it on heroku: heroku config:add PRIVATE_GITHUB_SIGNING_KEY="$(cat thekey.pem)"
 */
export const PRIVATE_GITHUB_SIGNING_KEY =
  getEnv("PRIVATE_GITHUB_SIGNING_KEY") && getEnv("PRIVATE_GITHUB_SIGNING_KEY").trim()

/**
 * The ID for the GitHub integration
 */
export const PERIL_INTEGRATION_ID = getEnv("PERIL_INTEGRATION_ID")

/** The front-end URL route  */
export const WEB_URL = getEnv("WEB_URL")

/**
 * Database JSON File, as a github URL
 * e.g. "orta/peril@settings.json"
 * Which is settings.json in the root of the repo orta/peril
 */
export const DATABASE_JSON_FILE = getEnv("DATABASE_JSON_FILE")

/**
 * The ID for the GitHub installation, you can find this in the
 * `integration_installation` event sent by GitHub. Only needed if
 * you are doing JSON based Dangerfiles.
 *
 * In theory this can be optional if the repo is OSS.
 */
export const PERIL_ORG_INSTALLATION_ID = getEnv("PERIL_ORG_INSTALLATION_ID")

/** Postgres db URL */
export const DATABASE_URL = getEnv("DATABASE_URL")

/** Should fetch log out to the console? */
export const LOG_FETCH_REQUESTS = getEnv("LOG_FETCH_REQUESTS")

/** Papertrail url */
export const PAPERTRAIL_URL = getEnv("PAPERTRAIL_URL")

/** Papertrail port */
export const PAPERTRAIL_PORT = getEnv("PAPERTRAIL_PORT")

/** So that we can comment reliably */
export const PERIL_BOT_USER_ID = getEnv("PERIL_BOT_USER_ID")

/** Adds some security on the URL */
export const PERIL_WEBHOOK_SECRET = getEnv("PERIL_WEBHOOK_SECRET")

/** Is this a public facing instance of Peril? E.g. is it the definitive server */
export const PUBLIC_FACING_API = !!getEnv("PUBLIC_FACING_API")

// Can't run without these
validates(["PRIVATE_GITHUB_SIGNING_KEY", "PERIL_INTEGRATION_ID"])

// Validate the db
if (!DATABASE_URL && !DATABASE_JSON_FILE) {
  throw new Error("Peril cannot work without either a DATABASE_URL or a DATABASE_JSON_FILE")
}
