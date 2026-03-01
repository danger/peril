/**
 * There's value in not running Dangerfiles for every webhook
 * mainly that it's wasteful, so this gives us
 */
export const actionForWebhook = (webhook: any): string | null => {
  // PR/Issues etc
  if (webhook.action) {
    return webhook.action
  }

  // Are there more worth adding?

  // Fallback for Status
  // https://developer.github.com/v3/activity/events/types/#statusevent
  if (webhook.state) {
    return webhook.state
  }

  return null
}
