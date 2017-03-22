import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { GitHubUser } from "../../db/types"

export async function isUserInOrg(user: GitHubUser, org: string, api: GitHubAPI) {
    // https://developer.github.com/v3/orgs/members/#check-membership
    const res = await api.get(`orgs/${org}/members/${user}`)
    return res.status === 302
}
