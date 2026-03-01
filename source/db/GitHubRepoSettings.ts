export interface GitHubInstallationSettings {
  /**
   * An array of modules for Peril to install, requires a re-deploy of the server to update.
   * They will be `yarn install`'d on the deploy, and available for Dangerfiles.
   *
   * @see not used in Peril staging/prod. You can find those in the Peril package.json
   */
  modules?: string[]
  /**
   * An array of allowed ENV vars which are passed into Dangerfiles.
   *
   * @see not used in Peril staging/prod. These are managed via the admin dashboard
   */
  env_vars?: string[]
  /**
   * An array of repos that should not run any Peril dangerfiles. This is so that you can
   * turn on Peril for an entire org, and just make the occasional edge case.
   */
  ignored_repos?: string[]
}
