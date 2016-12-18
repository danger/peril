import * as node_fetch from "node-fetch" 
import { LOG_FETCH_REQUESTS, PRIVATE_GITHUB_SIGNING_KEY, PERIL_INTEGATION_ID } from "../globals"

import originalFetch from "./fetch"
import { getIntegration, updateIntegration } from "../db/mongo"
import * as jwt from "jsonwebtoken"

/** A version of fetch that handled integration-based authentication, adds the github domain to the path  */
export async function fetch(integrationID: number, path: string | node_fetch.Request, init?: node_fetch.RequestInit): Promise<node_fetch.Response> {
  const url = "https://api.github.com" + path
  const integration = await getIntegration(integrationID)

  // Ensure token  is in date
  const tokenExpiryDate = Date.parse(integration.accessToken)
  const now = new Date()
  const expired = now.getTime() > tokenExpiryDate;
  
  let token = integration.accessToken
  
  // Has token expired?
  if (expired) {
    const newToken = await getAccessTokenForIntegration(integrationID)
    const credentials = await newToken.json()
    token = credentials.token

    // Update db, no need to await it
    integration.accessToken = token
    integration.tokenExpires = credentials.expires_at
    updateIntegration(integration)
  }

  const options: any = {
    ...init,
    headers: {
      ...init.headers,
      "Accept": "application/vnd.github.machine-man-preview+json",
      "Authorization": `token ${token}`
    }
  }
  return originalFetch(url, options)
}


export function getAccessTokenForIntegration(integrationID: number) {
  const url = `https://api.github.com/installations/${integrationID}/access_tokens`
  return originalFetch(url, {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "Authorization": `Bearer ${jwtForGitHubAuth()}`,
      "Accept": "application/vnd.github.machine-man-preview+json" }
  })
}

export function jwtForGitHubAuth() {
  const now = Math.round(new Date().getTime() / 1000)
  const expires = now + 60
  const keyContent = PRIVATE_GITHUB_SIGNING_KEY
  return jwt.sign({
    iat: now,
    exp: expires,
    iss: PERIL_INTEGATION_ID
  }, keyContent, { algorithm:"RS256" })
}
