import * as express from "express"

import { Installation } from "../events/types/integration_installation_created.types"

import { getDB } from "../../db/getDB"
import generateInstallation from "../../testing/installationFactory"

export async function createInstallation(installationJSON: Installation, _: express.Request, res: express.Response) {
  const installation = generateInstallation({ iID: installationJSON.id })

  const db = getDB()
  const existingInstallation = await db.getInstallation(installation.iID)
  if (existingInstallation) {
    res.status(204).send("Did not create new installation, it already existed.")
  } else {
    await db.saveInstallation(installation)
    res.status(200).send("Creating new installation.")
  }
}
