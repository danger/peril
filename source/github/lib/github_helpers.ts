import fetch from "../../api/fetch"
import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import { RepresentationForURL } from "../../danger/danger_run"
import { PERIL_ORG_INSTALLATION_ID } from "../../globals"
import winston from "../../logger"

export async function canUserWriteToRepo(token: string, user: string, repoSlug: string) {
  // https://developer.github.com/v3/repos/collaborators/#review-a-users-permission-level
  const req = await api(token, `repos/${repoSlug}/collaborators/${user}/permission`)
  const res = await req.json()
  return res.permission === "admin" || res.permission === "write"
}

export async function getGitHubFileContentsFromLocation(
  token: string | null,
  location: RepresentationForURL,
  defaultRepo: string
) {
  return getGitHubFileContents(token, location.repoSlug || defaultRepo, location.dangerfilePath, location.branch)
}

/**
 * This function allows you to get the contents of a file from GitHub,
 * given a token.
 * Returns either the contents or an empty string.
 */
export async function getGitHubFileContents(token: string | null, repoSlug: string, path: string, ref: string | null) {
  const refString = ref ? `ref=${ref}` : ""
  const res = await api(token, `repos/${repoSlug}/contents/${path}?${refString}`)
  const data = await res.json()
  if (res.ok) {
    const buffer = Buffer.from(data.content, "base64")
    return buffer.toString()
  } else {
    winston.error("res: " + res.url)
    winston.error("Getting GitHub file failed: " + JSON.stringify(data))
    return ""
  }
}

/**
 * There's definitely a time when you want access to a GitHub file
 * but won't have an auth token to do it yet, this function should
 * help out there, as long as the Peril key and installation ID are
 * in the environment it will build the appropriate auth.
 * Returns either the contents or an empty string.
 */
export async function getGitHubFileContentsWithoutToken(repo: string, path: string) {
  // Try see if we can pull it without an access token
  const file = await getGitHubFileContents(null, repo, path, null)
  if (file !== "") {
    return file
  }

  // Might be private, in this case you have to have set up PERIL_ORG_INSTALLATION_ID
  if (!PERIL_ORG_INSTALLATION_ID) {
    throwNoPerilInstallationID()
  }

  const token = await getTemporaryAccessTokenForInstallation(PERIL_ORG_INSTALLATION_ID)
  return await getGitHubFileContents(token, repo, path, null)
}

const throwNoPerilInstallationID = () => {
  /* tslint:disable: max-line-length */
  const msg =
    "Sorry, if you have a Peril JSON settings file in a private repo, you will need an installation ID for your integration."
  const subtitle =
    "You can find this inside the integration_installation event sent when you installed the integration into your org."
  const action = `Set this as "PERIL_ORG_INSTALLATION_ID" in your ENV vars.`
  throw new Error([msg, subtitle, action].join(" "))
  /* tslint:enable: max-line-length */
}

/**
 * A quick GitHub API client
 */
async function api(token: string | null, path: string, headers: any = {}, body: any = {}, method: string = "GET") {
  if (token) {
    headers.Authorization = `token ${token}`
  }

  const baseUrl = process.env.DANGER_GITHUB_API_BASE_URL || "https://api.github.com"
  const includeBody = !(method === "GET" || method === "HEAD")
  return fetch(`${baseUrl}/${path}`, {
    body: includeBody ? body : undefined,
    headers: {
      Accept: "application/vnd.github.machine-man-preview+json",
      "Content-Type": "application/json",
      ...headers,
    },
    method,
  })
}
