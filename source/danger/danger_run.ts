import { DangerfileReferenceString, RunnerRuleset } from "../db"

/**
 * Think about it, we can't provide the same DSL
 * to a PR as we send to an Issue, or to User creation, the lack of
 * reference to a PR means that we can't do work like finding diffs.
 */
export enum RunType {
  /** What, for years, has been the "Danger DSL" */
  pr,
  /** Take whatever JSON triggered this run and use that as the `github.` DSL */
  import,
}

/** Can Danger reply inline? */
export enum RunFeedback {
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
  dslType: RunType
  /** Can Danger provide commentable feedback? */
  feedback: RunFeedback
}

/** Takes an event and action, and defines whether to do a dangerfile run with it. */
export const dangerRunForRules = (
  event: string,
  action: string | null,
  requestBody: any,
  rule: RunnerRuleset | undefined | null
): DangerRun[] => {
  // tslint:disable-line
  // Can't do anything with nothing
  if (!rule) {
    return []
  }

  const directKey = event
  const globsKey = event + ".*"
  const dotActionKey = event + "." + action

  let allKeys = [directKey, globsKey, dotActionKey]

  if (action === "labeled" || action === "unlabeled") {
    const labelName: string = requestBody.label.name
    allKeys.push(event + "." + action + "." + labelName)
  }

  const arraydVersions = Object.keys(rule)
    .filter(key => {
      const indvRules = key.split(",").map(i => i.trim())
      return allKeys.some(key => indvRules.includes(key))
    })
    .map(key => {
      const alwaysArray = (t: any) => (Array.isArray(t) ? t : [t])
      return alwaysArray(rule[key])
    })

  let possibilities: string[] = []
  arraydVersions.forEach(arr => {
    possibilities = possibilities.concat(arr)
  })

  return possibilities.map(path => ({
    action,
    dslType: dslTypeForEvent(event),
    event,
    ...dangerRepresentationForPath(path),
    feedback: feedbackTypeForEvent(event),
  }))
}

export interface RepresentationForURL {
  dangerfilePath: string
  branch: string
  repoSlug: string | undefined
  referenceString: DangerfileReferenceString
}

/** Takes a DangerfileReferenceString and lets you know where to find it globally */
export const dangerRepresentationForPath = (value: DangerfileReferenceString): RepresentationForURL => {
  const afterAt = value.includes("@") ? value.split("@")[1] : value
  return {
    branch: value.includes("#") ? value.split("#")[1] : "master",
    dangerfilePath: afterAt.split("#")[0],
    repoSlug: value.includes("@") ? value.split("@")[0] : undefined,
    referenceString: value,
  }
}

/** What type of DSL should get used for the Dangerfile eval? */
export const dslTypeForEvent = (event: string): RunType => {
  if (event === "pull_request") {
    return RunType.pr
  }
  return RunType.import
}

/** What events can we provide feedback inline with? */
// Build system mentions?
export const feedbackTypeForEvent = (event: string): RunFeedback => {
  if (event === "pull_request" || event === "issues" || event === "issue") {
    return RunFeedback.commentable
  }
  return RunFeedback.silent
}
