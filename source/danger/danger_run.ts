import _ = require("lodash")
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
  rule: RunnerRuleset | undefined | null,
  webhook: any
): DangerRun[] => {
  // tslint:disable-line
  // Can't do anything with nothing
  if (!rule) {
    return []
  }

  // These are the potential keys that could trigger a run
  const directKey = event
  const globsKey = event + ".*"
  const dotActionKey = event + "." + action

  const arrayVersions = Object.keys(rule)
    // Look through all existing rules to see if we can
    // find a key that matches the incoming rule
    .filter(key => {
      // Take into account comma split strings:
      //   "pull_request.opened, pull_request.closed"
      //
      // also take into account webhook checking:
      //   "pull_request (pull_request.id == 12)"
      //
      const eachRule = key.split(",").map(i => i.split("(")[0].trim())
      const allKeys = [directKey, globsKey, dotActionKey]
      return allKeys.some(potentialKey => eachRule.includes(potentialKey))
    })
    .filter(key => {
      // Do the webhook data check, return early if there's no () or ==
      if (!key.includes("(") || !key.includes("==")) {
        return true
      }
      try {
        // get inside the ( )
        const inner = key.split("(")[1].split(")")[0]
        // allow (x == 1) and (x==1)
        const keypath = inner.split(" ")[0].split("=")[0]
        const value = _.get(webhook, keypath)
        let expected: any = inner.split("==")[1].trim()

        // handle boolean values
        if (expected === "true") {
          expected = true
        }
        if (expected === "false") {
          expected = false
        }
        // We want to allow things like 1 to equal "1"
        // tslint:disable-next-line:triple-equals
        return value == expected
      } catch (error) {
        // Bail, so just always fail to indicate that it didn't run
        return false
      }
    })
    .map(key => {
      const alwaysArray = (t: any) => (Array.isArray(t) ? t : [t])
      return alwaysArray(rule[key])
    })

  let possibilities: string[] = []
  arrayVersions.forEach(arr => {
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
  /** The path the the file aka folder/file.ts  */
  dangerfilePath: string
  /** The branch to find the dangerfile on  */
  branch: string
  /** An optional repo */
  repoSlug: string | undefined
  /** The original full string, with repo etc  */
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
