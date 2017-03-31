import { DangerfileReferenceString, RunnerRuleset } from "../db"

/**
 * Think about it, we can't provide the same DSL
 * to a PR as we send to an Issue, or to User creation.
 *
 * This is a stop-gap, (ish()) I wonder if I can annotate the
 * JSON DSLs to help build your own dangerfiles for those.
 *
 * It may make sense to just throw the JSON from the integration
 * event directly into the global scope.
 */
export enum dsl {
  /** What for years has been the "Danger DSL" */
  pr,
  /** Take whatever triggered this run and use that as the DSL */
  import,
}

/** Represents runs that Danger should do based on Rules and Events */
export interface DangerRun {
  /** What event name triggered this */
  event: string,
  /** What action inside that event trigger this run */
  action: string | null,
  /** What slug should this run come from? */
  repoSlug?: string
  /** Where should we look in that repo for the Dangerfile? */
  dangerfilePath: string
  /** What type of DSL should the run use? */
  dslType: dsl
}

/** Takes an event and action, and defines whether to do a dangerfile run with it. */
export const actionForRule = (event: string, action: string | null, rule: RunnerRuleset): DangerRun | null =>  {
  // Direct hits, make the rule
  const isDirect = rule[event]
  const globsAll = rule[event + ".*"]
  const eventDotAction = action && rule[event + "." + action]
  const path = isDirect || globsAll || eventDotAction

  if (path) {
    return { event, action, dslType: dslTypeForEvent(event), ...dangerRepresentationforPath(path) }
  } else {
    return null
  }
}

/** Takes a DangerfileReferenceString and lets you know where to find it globally */
export const dangerRepresentationforPath = (value: DangerfileReferenceString) => {
  if (!value.includes("@")) {
    return { dangerfilePath: value }
  } else {
    return {
      dangerfilePath: value.split("@")[1] as string,
      repoSlug: value.split("@")[0] as string
    }
  }
}

/** What type of DSL should yu use for the Dangerfile eval? */
export const dslTypeForEvent = (event: string): dsl => {
  if (event === "pull_request") { return dsl.pr }
  return dsl.import
}
