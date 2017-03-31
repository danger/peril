import * as node_fetch from "node-fetch"
import { LOG_FETCH_REQUESTS, PERIL_INTEGATION_ID, PRIVATE_GITHUB_SIGNING_KEY } from "../globals"

import * as fs from "fs"
import * as os from "os"

import * as jwt from "jsonwebtoken"
import * as winston from "winston"
import { getInstallation, GitHubInstallation, updateInstallation } from "../db"
import originalFetch from "./fetch"

export async function getTemporaryAccessTokenForInstallation(installation: GitHubInstallation): Promise<string> {
  const newToken = await requestAccessTokenForInstallation(installation.id)
  const credentials = await newToken.json()
  if (!newToken.ok) {
    winston.log("Token", `Could not get an access token for ${installation.id}`)
    winston.log("Token", `GitHub returned: ${JSON.stringify(credentials)}`)
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
  const expires = now + 60
  const keyContent = PRIVATE_GITHUB_SIGNING_KEY

  return jwt.sign({
    exp: expires,
    iat: now,
    iss: PERIL_INTEGATION_ID,
  }, keyContent, { algorithm: "RS256" })
}
