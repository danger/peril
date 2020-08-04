import * as express from "express"
import { deleteLambdaFunctionNamed } from "../../api/aws/lambda"
import { getDB } from "../../db/getDB"
import { Installation } from "./types/installation.types"

export async function deleteInstallation(installationJSON: Installation, _: express.Request, res: express.Response) {
  const iID = installationJSON.id

  const db = getDB()
  const installation = await db.getInstallation(iID)

  if (!installation) {
    res.status(404)
    res.send("Could not find installation for deletion.")
    return
  }

  // Remove the lambda so AWS doesn't get filled up with every exploration
  if (installation.lambdaName) {
    await deleteLambdaFunctionNamed(installation.lambdaName)
  }

  // Kill it from the DB
  db.deleteInstallation(iID)

  res.status(200)
  res.send("Deleted installation.")
}
