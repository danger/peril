import * as express from "express"

import { Installation } from "../events/types/integration_installation_created.types"

import { getDB } from "../../db/getDB"
import generateInstallation from "../../testing/installationFactory"

export async function createInstallation(installationJSON: Installation, _: express.Request, res: express.Response) {
  // Default to no runnerRules
  const installation = generateInstallation({ id: installationJSON.id })
  res.status(200).send("Creating new installation.")

  const db = getDB()
  await db.saveInstallation(installation)
}
