export enum RuntimeEnvironment {
  /** On Heroku */
  Standalone,
  /** Peril prod/staging */
  Peril,
  /** Inside the peril runner in a docker */
  Runner,
  /** dunno */
  Unknown,
}
