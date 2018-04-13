import * as dotenv from "dotenv"
const isJest = typeof jest !== "undefined"
const config = isJest ? { path: ".env.sample" } : {}
dotenv.config(config)

/**
 * Pulls out an env var from either the host ENV, or a config file
 *
 * @param {string} local ENV key
 * @param {string} configName Config key
 * @returns {string}
 */
function getEnv(configName: string): string {
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

const getInstallationId = (id: string | undefined): number => {
  let installationId: number | undefined = parseInt(id as string, 10)
  if (Number.isNaN(installationId)) {
    installationId = undefined
  }
  return installationId as number
}

/**
 * The ID for the GitHub installation, you can find this in the
 * `integration_installation` event sent by GitHub. Only needed if
 * you are doing JSON based Dangerfiles.
 *
 * In theory this can be optional if the repo is OSS.
 */
export const PERIL_ORG_INSTALLATION_ID = getInstallationId(getEnv("PERIL_ORG_INSTALLATION_ID"))

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

/** The URL for a Mongo DB instance, currently used for  */
export const MONGODB_URI = getEnv("MONGODB_URI")

/** Optional: the hyper access key, adding this will convert
 *  Peril to run in a process separated mode.
 */
export const HYPER_ACCESS_KEY = getEnv("HYPER_ACCESS_KEY")

/** Optional: the hyper secret key from hyper.sh. */
export const HYPER_SECRET_KEY = getEnv("HYPER_SECRET_KEY")

/** Optional: the function name that represents a danger run */
export const HYPER_FUNC_NAME = getEnv("HYPER_FUNC_NAME")

export const validateENVForPerilServer = () => {
  // Can't run without these
  validates(["PRIVATE_GITHUB_SIGNING_KEY", "PERIL_INTEGRATION_ID"])

  // Validate the db
  if (!MONGODB_URI && !DATABASE_JSON_FILE) {
    throw new Error("Peril cannot work without either a MONGODB_URI or a DATABASE_JSON_FILE")
  }
}
