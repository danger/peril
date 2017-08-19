import * as express from "express"
import winston from "../../logger"

import * as fs from "fs"

import { getTemporaryAccessTokenForInstallation } from "../../api/github"

import { PERIL_ORG_INSTALLATION_ID } from "../../globals"

import perilPlatform from "../../danger/peril_platform"

import { dsl } from "../../danger/danger_run"

import { getCISourceForEnv } from "danger/distribution/ci_source/get_ci_source"
import { DangerResults } from "danger/distribution/dsl/DangerResults"
import { GitHub } from "danger/distribution/platforms/GitHub"
import { GitHubAPI } from "danger/distribution/platforms/github/GitHubAPI"
import { runDangerfileEnvironment } from "danger/distribution/runner/DangerfileRunner"
import { Executor, ExecutorOptions } from "danger/distribution/runner/Executor"
import { executorForInstallation } from "../../danger/danger_runner"
import { githubAPIForCommentable } from "../../github/events/github_runner"

const prDSLRunner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  winston.log("router", `Recieved OK`)

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

  const token = await getTemporaryAccessTokenForInstallation(parseInt(PERIL_ORG_INSTALLATION_ID, 10))

  const ghDetails = {
    fullName: query.owner + "/" + query.repo,
    prID: query.number,
  }

  const githubAPI = githubAPIForCommentable(token, ghDetails.fullName, ghDetails.prID)

  const gh = new GitHub(githubAPI)
  const platform = perilPlatform(dsl.pr, gh, {})

  const exec = await executorForInstallation(platform)
  const dangerDSL = await exec.dslForDanger()

  // Remove this to reduce data
  dangerDSL.github.api = {} as any

  // TODO: include Danger version number in JSON
  return res.status(400).jsonp({
    danger: dangerDSL,
    status: "OK",
  })
}

export default prDSLRunner
