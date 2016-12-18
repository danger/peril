/**
 * A GitHub user account
 */
export interface GitHubUser {
  /**
   * Generic UUID
   * @type {number}
   */
  id: number,
  /**
   * The handle for the user/org
   * @type {string}
   */
  login: string,
  /**
   * Whether the user is an org, or a user
   * @type {string}
   */
  type: "User" | "Organization"
}

/**
 * A GitHub Repo
 */
export interface GitHubRepo {
  /**
   * Generic UUID
   * @type {number}
   */
  id: number,

  /**
   * The name of the repo, e.g. "Danger-JS"
   * @type {string}
   */
  name: string,

  /**
   * The full name of the owner + repo, e.g. "Danger/Danger-JS"
   * @type {string}
   */
  full_name: string,

  /**
   * The owner of the repo
   * @type {GitHubUser}
   */
  owner: GitHubUser,

  /**
   * Is the repo publicly accessible?
   * @type {bool}
   */
  private: boolean,

  /**
   * The textual description of the repo
   * @type {string}
   */
  description: string,

  /**
   * Is the repo a fork?
   * @type {bool}
   */
  fork: false
}
