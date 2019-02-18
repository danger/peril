
/**
 * Try to get a repo string for the context of the webhook
 */
export const repoNameForWebhook = (webhook: any): string | null => {
  // PR/Issues/Statuses etc
  if (webhook.repository) {
    return webhook.repository.full_name
  }

  // Are there more worth adding?
  return null
}
