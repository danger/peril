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

/** Can Danger reply inline? */
export enum feedback {
  /** What for years has been the "Danger DSL" */
  commentable,
  /** Take whatever triggered this run and use that as the DSL */
  silent,
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
  dslType: dsl,
  /** Can Danger provide commentable feedback? */
  feedback: feedback
}

/** Takes an event and action, and defines whether to do a dangerfile run with it. */
export const dangerRunForRules = (event: string, action: string | null, rule: RunnerRuleset | undefined | null): DangerRun | null => { // tslint:disable-line
  // Can't do anything with nothing
  if (!rule) { return null }

  // We can just see if anything exists at the right places,
  // and return the first right object
  const isDirect = rule[event]
  const globsAll = rule[event + ".*"]
  const eventDotAction = action && rule[event + "." + action]
  const path = isDirect || globsAll || eventDotAction

  // Bail, we can't do anything
  if (!path) { return null }

  return {
    event,
    action,
    dslType: dslTypeForEvent(event),
    ...dangerRepresentationforPath(path),
    feedback: feedbackTypeForEvent(event)
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

/** What events can we provide feedback inline with? */
export const feedbackTypeForEvent = (event: string): feedback => {
  if (event === "pull_request" || event === "issue") { return feedback.silent }
  return feedback.silent
}
