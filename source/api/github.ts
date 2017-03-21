import * as node_fetch from "node-fetch"
import { LOG_FETCH_REQUESTS, PERIL_INTEGATION_ID, PRIVATE_GITHUB_SIGNING_KEY } from "../globals"

import * as jwt from "jsonwebtoken"
import { getInstallation, GitHubInstallation, updateInstallation } from "../db/mongo"
import originalFetch from "./fetch"

export async function ensureInstallationIsUpToDate(installation: GitHubInstallation): Promise<GitHubInstallation> {

  // Ensure token is in date
  const tokenExpiryDate = Date.parse(installation.tokenExpires)
  const now = new Date()
  const expired = now.getTime() > tokenExpiryDate
  let token = installation.accessToken

  // Has token expired?
  if (expired) {
    const newToken = await getAccessTokenForInstallation(installation.id)
    const credentials = await newToken.json()
    token = credentials.token

    // Update db, no need to await it
    installation.accessToken = token
    installation.tokenExpires = credentials.expires_at
    await updateInstallation(installation)
  }

  return installation
}

export function getAccessTokenForInstallation(installationID: number) {
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
