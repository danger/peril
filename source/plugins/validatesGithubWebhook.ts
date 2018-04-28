import * as express from "express"

export const validatesGithubWebhook = async (_: string, req: express.Request, res: express.Response, __: any) => {
  const xhubReq = req as any
  if (!xhubReq.isXHub) {
    return res
      .status(400)
      .send("Request did not include x-hub header - You need to set a secret in the GitHub App + PERIL_WEBHOOK_SECRET.")
  }

  if (!xhubReq.isXHubValid()) {
    return res
      .status(401)
      .send("Request did not have a valid x-hub header. Perhaps PERIL_WEBHOOK_SECRET is not set up right?")
  }

  return false
}
