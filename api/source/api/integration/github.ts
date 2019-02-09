import { NextFunction, Request, Response } from "express"
import { PUBLIC_GITHUB_APP_URL } from "../../globals"

export const redirectForGHInstallation = (_: Request, res: Response, ___: NextFunction) => {
  res.redirect(PUBLIC_GITHUB_APP_URL)
}
