import * as express from "express"

export function ping(_: express.Request, res: express.Response) {
  res.status(200).send("pong")
}
