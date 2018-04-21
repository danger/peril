import * as debug from "debug"
import * as express from "express"
import { PullRequest, Push } from "github-webhook-event-types"
import { dangerRepresentationForPath } from "../danger/danger_run"
import { getDB } from "../db/getDB"
import winston from "../logger"

const d = debug("Peril Settings Updater")

export const settingsUpdater = async (event: string, req: express.Request, _: express.Response, __: any) => {
  if (event === "pull_request" || event === "push") {
    const db = getDB()
    const installationID = req.body.installation.id

    // Handle checking if a merged PR includes changes to the settings JSON
    if (event === "pull_request" && req.body.action === "closed" && req.body.pull_request.merged) {
      const body = req.body as PullRequest

      const installation = await db.getInstallation(installationID)
      if (!installation) {
        d.log(`PR: Could not find an installation for ${installationID} `)
        return
      }

      const rep = dangerRepresentationForPath(installation.perilSettingsJSONURL)
      if (rep.repoSlug && rep.dangerfilePath) {
        const repo = rep.repoSlug!

        // TODO: verify that the settings json did change
        // We could keep track of the commit for the file?
        // const path =  rep.dangerfilePath!

        const hookRepo = body.repository.full_name
        if (repo === hookRepo) {
          winston.info("Updating JSON settings due to merged PR for " + installationID)
          await db.updateInstallation(installationID)
        }
      }
    }

    // When you just push to master
    if (event === "push") {
      const body = req.body as Push

      const installation = await db.getInstallation(installationID)
      if (!installation) {
        d(`Push: Could not find an installation for ${installationID}`)
        return
      }

      const rep = dangerRepresentationForPath(installation.perilSettingsJSONURL)
      const ref = body.ref
      const hookRepo = body.repository.full_name
      const repo = rep.repoSlug
      const path = rep.dangerfilePath

      if (hookRepo === repo && ref === "refs/heads/master") {
        const commits = req.body.commits as any[]
        const modifiedPerilSettings = commits.find(c => c.modified.includes(path))
        if (modifiedPerilSettings) {
          winston.info("Updating JSON settings due to merged changes on push for " + path)
          await db.updateInstallation(installationID)
        }
      }
    }
  }
}
