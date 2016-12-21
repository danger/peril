import * as express from "express"

export function ping(req: express.Request, res: express.Response) {
  res.status(200).send("pong")
}
