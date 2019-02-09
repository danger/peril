import * as express from "express"
import winston from "../../logger"

import { GitHub } from "danger/distribution/platforms/GitHub"
import inline from "danger/distribution/runner/runners/inline"

import { getTemporaryAccessTokenForInstallation } from "../../api/github"
import { RunType } from "../../danger/danger_run"
import { executorForInstallation } from "../../danger/danger_runner"
import { getPerilPlatformForDSL } from "../../danger/peril_platform"
import { githubAPIForCommentable } from "../../github/events/utils/commenting"
import { PERIL_ORG_INSTALLATION_ID } from "../../globals"

export const prDSLRunner = async (req: express.Request, res: express.Response, _: express.NextFunction) => {
  winston.log("router", `Received OK`)

  const query = req.query
  if (!query.owner) {
    return res.status(422).jsonp({ error: "No `owner` query param sent." })
  }

  if (!query.repo) {
    return res.status(422).jsonp({ error: "No `repo` query param sent." })
  }

  if (!query.number) {
    return res.status(422).jsonp({ error: "No `number` query param sent." })
  }

  // This has to be set for public usage.
  if (!PERIL_ORG_INSTALLATION_ID) {
    throw new Error("You can't support PR DSLs without setting up the PERIL_ORG_INSTALLATION_ID")
  }

  const token = await getTemporaryAccessTokenForInstallation(PERIL_ORG_INSTALLATION_ID)

  const ghDetails = {
    fullName: query.owner + "/" + query.repo,
    prID: query.number,
  }

  const githubAPI = githubAPIForCommentable(token, ghDetails.fullName, ghDetails.prID)

  const gh = GitHub(githubAPI)
  const platform = getPerilPlatformForDSL(RunType.pr, gh, {})

  const exec = await executorForInstallation(platform, inline, {})
  const dangerDSL = await exec.dslForDanger()

  // Remove this to reduce data
  if (dangerDSL.github) {
    dangerDSL.github.api = {} as any
  }

  // TODO: include Danger version number in JSON
  return res.status(400).jsonp({
    danger: dangerDSL,
    status: "OK",
  })
}
