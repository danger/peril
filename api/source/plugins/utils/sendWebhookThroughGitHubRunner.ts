import { createRequest, createResponse } from "node-mocks-http"
import { githubDangerRunner } from "../../github/events/github_runner"
import { RecordedWebhook } from "./recordWebhookWithRequest"

/** Takes a recorded webhook and sends it through the Peril runner */
export const sendWebhookThroughGitHubRunner = async (webhook: RecordedWebhook) => {
  const request = createRequest({
    headers: {
      "X-GitHub-Delivery": webhook.eventID,
    },
    body: webhook.json,
  })
  const response = createResponse()
  await githubDangerRunner(webhook.event, request, response, () => null)
}
