import { DangerfileReferenceString, RunnerRuleset } from "../db"

/**
 * Think about it, we can't provide the same DSL
 * to a PR as we send to an Issue, or to User creation, the lack of
 * reference to a PR means that we can't do work like finding diffs.
 */
export enum dsl {
  /** What, for years, has been the "Danger DSL" */
  pr,
  /** Take whatever JSON triggered this run and use that as the `github.` DSL */
  import,
}

/** Can Danger reply inline? */
export enum feedback {
  /** Is there a way in which Danger can provide any feedback? */
  commentable,
  /** Can only execute the JS, no feedback into an issue as the event doesn't correlate to one */
  silent,
}

/** Represents runs that Danger should do based on Rules and Events */
export interface DangerRun extends RepresentationForURL {
  /** What event name triggered this */
  event: string
  /** What action inside that event trigger this run */
  action: string | null
  /** What type of DSL should the run use? */
  dslType: dsl
  /** Can Danger provide commentable feedback? */
  feedback: feedback
}

/** Takes an event and action, and defines whether to do a dangerfile run with it. */
export const dangerRunForRules = (
  event: string,
  action: string | null,
  rule: RunnerRuleset | undefined | null
): DangerRun | null => {
  // tslint:disable-line
  // Can't do anything with nothing
  if (!rule) {
    return null
  }

  // We can just see if anything exists at the right places,
  // and return the first right object
  const isDirect = rule[event]
  const globsAll = rule[event + ".*"]
  const eventDotAction = action && rule[event + "." + action]
  const path = isDirect || globsAll || eventDotAction

  // Bail, we can't do anything
  if (!path) {
    return null
  }

  return {
    action,
    dslType: dslTypeForEvent(event),
    event,
    ...dangerRepresentationforPath(path),
    feedback: feedbackTypeForEvent(event),
  }
}

interface RepresentationForURL {
  dangerfilePath: string
  branch: string
  repoSlug: string | undefined
}

/** Takes a DangerfileReferenceString and lets you know where to find it globally */
export const dangerRepresentationforPath = (value: DangerfileReferenceString): RepresentationForURL => {
  return {
    branch: value.includes("#") ? value.split("#")[0] : "master",
    dangerfilePath: value.split("#")[0],
    repoSlug: value.includes("@") ? value.split("@")[0] : undefined,
  }
}

/** What type of DSL should get used for the Dangerfile eval? */
export const dslTypeForEvent = (event: string): dsl => {
  if (event === "pull_request") {
    return dsl.pr
  }
  return dsl.import
}

/** What events can we provide feedback inline with? */
// Build system mentions?
export const feedbackTypeForEvent = (event: string): feedback => {
  if (event === "pull_request" || event === "issues" || event === "issue") {
    return feedback.commentable
  }
  return feedback.silent
}
