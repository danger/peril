import { NextFunction, Request, Response } from "express"

import { RequestInit } from "node-fetch"
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, PERIL_WEBHOOK_SECRET, PUBLIC_API_ROOT_URL } from "../../globals"
import { GitHubOAuthEnd } from "../api"
import fetch from "../fetch"
import { createPerilJWT } from "./generate"

/** { a: 1, b: 2} -> a=1&=2 */
const encodeToQueryParams = (data: any): string =>
  Object.keys(data)
    .map(key => {
      return [key, data[key]].map(encodeURIComponent).join("=")
    })
    .join("&")

/** Handle sending someone off to GitHub for the start of OAuth */
export const redirectForGHOauth = (req: Request, res: Response, ___: NextFunction) => {
  // Re-direct for GH web flow
  // https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#web-application-flow
  //
  const gh = "https://github.com/login/oauth/authorize"
  const params = {
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: PUBLIC_API_ROOT_URL + GitHubOAuthEnd + "?redirect=" + req.query.redirect,
    scope: "read:user read:org",
    state: PERIL_WEBHOOK_SECRET,
  }
  const address = `${gh}?${encodeToQueryParams(params)}`
  res.redirect(address)
}

export const generateAuthToken = async (req: Request, res: Response, ___: NextFunction) => {
  // https://developer.github.com/apps/building-oauth-apps/authorization-options-for-oauth-apps/#2-users-are-redirected-back-to-your-site-by-github

  const { error, error_description, error_uri, redirect } = req.query
  if (error) {
    res.status(400).send({ error, error_description, error_uri })
    return
  }

  // Receive the GH auth token, then generate enough info for a Peril User & JWT
  // Set that to the user's session, and then redirect to the admin page
  const { code, state } = req.query
  if (state !== PERIL_WEBHOOK_SECRET) {
    res.status(400).send({ error: "Bad state", error_description: "The state query param was incorrect" })
    return
  }

  const token = await getAccessTokenFromAuthCode(code)
  if (!token) {
    if (error) {
      res.status(400).send({ error: "Could not generate an access token from the code given from GitHub" })
      return
    }
  }

  const installations = await getUserInstallations(token)

  const user = await getUserAccount(token)

  const authToken = createPerilJWT({ name: user.name, avatar_url: user.avatar_url }, installations)
  // TODO: add max age
  // TODO: This needs to change when we have production vs staging
  res.cookie("jwt", authToken, { domain: ".peril.systems" })

  if (redirect) {
    res.redirect(redirect)
  } else {
    res.status(200).send({ jwt: authToken })
  }
}

const getAccessTokenFromAuthCode = async (code: string) => {
  const gh = "https://github.com/login/oauth/access_token"
  const options: RequestInit = {
    headers: {
      Accept: "application/json",
    },
    method: "POST",
  }
  const params = {
    client_id: GITHUB_CLIENT_ID,
    client_secret: GITHUB_CLIENT_SECRET,
    state: PERIL_WEBHOOK_SECRET,
    code,
  }

  const tokenResponse = await fetch(`${gh}?${encodeToQueryParams(params)}`, options)
  const tokenJSON = await tokenResponse.json()
  return tokenJSON.access_token
}

const getUserAccount = async (token: string) => miniGHAPI("/user", token)

const getUserInstallations = async (token: string): Promise<number[]> => {
  const installations = await miniGHAPI("/user/installations", token)
  return installations.installations.map((i: any) => i.id)
}

const miniGHAPI = async (path: string, token: string) => {
  const gh = "https://api.github.com" + path

  const options = {
    headers: {
      Accept: "application/vnd.github.machine-man-preview+json",
    },
  }
  const params = {
    access_token: token,
  }

  const address = `${gh}?${encodeToQueryParams(params)}`
  const userResponse = await fetch(address, options)
  const json = await userResponse.json()
  return json
}
