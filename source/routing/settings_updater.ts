import * as express from "express"
import db from "../db"
import { DATABASE_JSON_FILE } from "../globals"

export const settingsUpdater = async (event: string, req: express.Request, res: express.Response, next: any) => {
  if (event === "push" && DATABASE_JSON_FILE) {
    const ref = req.body.ref
    const hookRepo = req.body.repository.full_name
    const repo = DATABASE_JSON_FILE.split("@")[0]
    const path = DATABASE_JSON_FILE.split("@")[1]

    if (hookRepo === repo && ref === "refs/heads/master") {
      const commits = req.body.commits as any[]
      const modifiedPerilSettings = commits.find(c => c.modified.includes(path))
      if (modifiedPerilSettings) {
        // RESTART
        console.log("Updating JSON settings due to merged changes for " + path) // tslint:disable-line
        db.setup()
      }
    }
  }
}
