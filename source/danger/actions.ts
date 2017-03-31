import { RunnerRuleset } from "../db"

/**
 * Think about it, we can't provide the same DSL
 * to a PR as we send to an Issue, or to User creation.
 *
 * This is a stop-gap, (ish()) I wonder if I can annotate the
 * JSON DSLs to help build your own dnagerfiles for those.
 */
export enum dsl {
  pr,
}

export interface DangerRun {
  /** What event name triggered this */
  event: string,
  /** What action inside that event trigger this run */
  action: string | null,
  /** What slug should this run come from? */
  repoSlug?: string
  /** What type of DSL should the run use? */
  dslType: dsl
}

export const actionForRule = (event: string, action: string | null, rule: RunnerRuleset): DangerRun | null =>  {
  // Direct hit, make the rule
  if (rule[event]) {
    return { event: "", action, dslType: dsl.pr }
  }

  

  return null
}
