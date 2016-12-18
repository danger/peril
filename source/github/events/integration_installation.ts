import * as express from 'express'
import fetch from "../../api/fetch"
import {PRIVATE_GITHUB_SIGNING_KEY, PERIL_INTEGATION_ID} from "../../globals"
import * as jwt from "jsonwebtoken"
import {GitHubInstallation, saveInstallation} from "../../db/mongo"

export async function integrationInstallation(req: express.Request, res: express.Response) {
  res.status(200).send("pong")
    
  const githubJWT = jwtForGitHubAuth()

  const token = await getAccessToken(req.body.installation.access_tokens_url, githubJWT)
  const credentials = await token.json()

  const installation: GitHubInstallation = {
    id: req.body.installation.id,
    account: req.body.installation.account,
    sender: req.body.installation.sender,
    accessToken: credentials.token,
    tokenExpires: credentials.expires_at
  }

  await saveInstallation(installation)
}

  function getAccessToken(url: string, jwt: string) {
    return fetch(url, {
      method: "POST",
      body: JSON.stringify({}),
      headers: {
        "Authorization": `Bearer ${jwt}`,
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
