import * as express from 'express'
import fetch from "node-fetch"
import * as pg from "pg"
import {PRIVATE_GITHUB_SIGNING_KEY, PERIL_INTEGATION_ID} from "../../globals"
import * as jwt from "jsonwebtoken"

export async function integrationInstallation(req: express.Request, res: express.Response, db: pg.Client) {
  res.status(200).send("pong")
  
  // const response = await db.query('INSERT INTO "public"."github_installations"("document") VALUES($1)', ['{ "id":11123 }'])
  const githubJWT = jwtForGitHubAuth()
  console.log(githubJWT)
  const token = await getAccessToken(req.body.installation.access_tokens_url, githubJWT)
  console.log(token)
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

function jwtForGitHubAuth() {
  const now = new Date().getTime()
  const expires = new Date().getTime() + 60
  const keyContent = PRIVATE_GITHUB_SIGNING_KEY
  return jwt.sign({
    iat: now,
    exp: expires,
    issue: PERIL_INTEGATION_ID
  }, keyContent, { algorithm:"RS256" })
}
