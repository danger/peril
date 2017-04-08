import fetch from "../../api/fetch"
import { GitHubUser } from "../../db/types"

export async function isUserInOrg(token: string, user: GitHubUser, org: string) {
    // https://developer.github.com/v3/orgs/members/#check-membership
    const res = await api(token, `orgs/${org}/members/${user}`)
    return res.status === 302
}

export async function getGitHubFileContents(token: string, repoSlug: string, path: string, ref: string) {
    const res = await api(token, `repos/${repoSlug}/contents/${path}?ref=${ref}`)
    if (res.ok) {
        const data = await res.json()
        const buffer = new Buffer(data.content, "base64")
        return buffer.toString()
    } else {
        return ""
    }
}

async function api(token: string, path: string, headers: any = {}, body: any = {}, method: string = "GET") {
    if (token) {
        headers.Authorization = `token ${token}`
    }

    const baseUrl = process.env.DANGER_GITHUB_API_BASE_URL || "https://api.github.com"
    return fetch(`${baseUrl}/${path}`, {
        method,
        body,
        headers: {
            "Accept": "application/vnd.github.machine-man-preview+json",
            "Content-Type": "application/json",
            ...headers,
        },
    })
}
