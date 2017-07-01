import * as node_fetch from "node-fetch"
import { LOG_FETCH_REQUESTS, PERIL_INTEGRATION_ID, PRIVATE_GITHUB_SIGNING_KEY } from "../globals"

import * as fs from "fs"
import * as os from "os"

import * as jwt from "jsonwebtoken"
import { GitHubInstallation } from "../db"
import winston from "../logger"
import originalFetch from "./fetch"

/** Logs */
const error = (message: string) => {
  winston.info(`[github auth] - ${message}`)
  console.error(message)
}

export async function getTemporaryAccessTokenForInstallation(installation: GitHubInstallation): Promise<string> {
  const newToken = await requestAccessTokenForInstallation(installation.id)
  const credentials = await newToken.json()
  if (!newToken.ok) {
    error(`Could not get an access token for ${installation.id}`)
    error(`GitHub returned: ${JSON.stringify(credentials)}`)
  }
  return credentials.token
}

export function requestAccessTokenForInstallation(installationID: number) {
  const url = `https://api.github.com/installations/${installationID}/access_tokens`
  const headers = {
    Accept: "application/vnd.github.machine-man-preview+json",
    Authorization: `Bearer ${jwtForGitHubAuth()}`,
  }
  return originalFetch(url, {
    body: JSON.stringify({}),
    headers,
    method: "POST",
  })
}

export function jwtForGitHubAuth() {
  const now = Math.round(new Date().getTime() / 1000)
  const expires: number = now + 60
  const keyContent = PRIVATE_GITHUB_SIGNING_KEY as string
  const payload: object = {
    exp: expires,
    iat: now,
    iss: PERIL_INTEGRATION_ID,
  }

  return jwt.sign(payload, keyContent, { algorithm: "RS256" })
}
