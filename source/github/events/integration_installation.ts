import * as express from 'express'
import fetch from "node-fetch"

export function integrationInstallation(req: express.Request, res: express.Response) {
  res.status(200).send("pong")
}
