import { GitHubUser } from "../../db/types"

export interface PullRequestJSON {
  action: string
  number: number
  pull_request: GithubPullRequest
  installation: GithubInstallation
  repository: GithubRepository
  organization: GitHubUser
  sender: GitHubUser
}

export interface GithubInstallation {
    id: number
}

export interface GithubRef {
    label: string
    ref: string
    sha: string
    user: GitHubUser
}

export interface GithubPullRequest {
    url: string
    id: number
    html_url: string
    diff_url: string
    patch_url: string
    issue_url: string
    number: number
    state: string
    locked: boolean
    title: string
    user: GitHubUser
    body: string
    created_at: Date
    updated_at: Date
    closed_at?: any
    merged_at?: any
    merge_commit_sha?: any
    assignee?: any
    assignees: any[]
    milestone?: any
    commits_url: string
    review_comments_url: string
    review_comment_url: string
    comments_url: string
    statuses_url: string
    head: GithubRef
    base: GithubRef
    merged: boolean
    mergeable?: any
    mergeable_state: string
    merged_by?: GitHubUser
    comments: number
    review_comments: number
    commits: number
    additions: number
    deletions: number
    changed_files: number
}

export interface GithubRepository {
    id: number
    name: string
    full_name: string
    owner: GitHubUser
    private: boolean
    html_url: string
    description: string
    fork: boolean
    url: string
    forks_url: string
    keys_url: string
    collaborators_url: string
    teams_url: string
    hooks_url: string
    issue_events_url: string
    events_url: string
    assignees_url: string
    branches_url: string
    tags_url: string
    blobs_url: string
    git_tags_url: string
    git_refs_url: string
    trees_url: string
    statuses_url: string
    languages_url: string
    stargazers_url: string
    contributors_url: string
    subscribers_url: string
    subscription_url: string
    commits_url: string
    git_commits_url: string
    comments_url: string
    issue_comment_url: string
    contents_url: string
    compare_url: string
    merges_url: string
    archive_url: string
    downloads_url: string
    issues_url: string
    pulls_url: string
    milestones_url: string
    notifications_url: string
    labels_url: string
    releases_url: string
    deployments_url: string
    created_at: Date
    updated_at: Date
    pushed_at: Date
    git_url: string
    ssh_url: string
    clone_url: string
    svn_url: string
    homepage: string
    size: number
    stargazers_count: number
    watchers_count: number
    language: string
    has_issues: boolean
    has_downloads: boolean
    has_wiki: boolean
    has_pages: boolean
    forks_count: number
    mirror_url?: any
    open_issues_count: number
    forks: number
    open_issues: number
    watchers: number
    default_branch: string
}
