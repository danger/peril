import { Payload, ValidatedPayload } from "../../../danger/danger_runner"

/**
 * Try to get a repo string for the context of the payload
 */
export const repoNameForPayload = (payload: Payload): string | null => {
  // Issues/Comments/Statuses etc
  if (payload.webhook && payload.webhook.repository) {
    return payload.webhook.repository.full_name
  }

  // PRs
  if (payload.dsl && (payload.dsl as any).git) {
    const dslPayload = payload as ValidatedPayload
    return dslPayload.dsl.github!.pr.base.repo.full_name
  }

  // Are there more worth adding?
  return null
}
