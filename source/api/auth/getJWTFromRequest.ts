import { parse } from "cookie"
import * as cookieParser from "cookie-parser"
import { isString } from "util"

/** Pulls out the JWT from the request, it can either be implicit via the cookies (client), or explicit in a header (server) */
export const getJWTFromRequest = (req: any) => {
  // Support JWT via cookies from the user session
  const cookies = (req && req.cookies) || (req && req.headers && req.headers.cookie)
  if (cookies && isString(cookies)) {
    return cookies && parse(cookies).jwt
  }

  if (cookies && cookieParser.JSONCookies(cookies).jwt) {
    return cookieParser.JSONCookies(cookies).jwt
  }

  // Support standard auth: "Authorization: Basic YWxhZGRpbjpvcGVuc2VzYW1l"
  const basicAuth = req.headers.Authorization || req.headers.authorization
  if (basicAuth) {
    if (basicAuth.includes("Basic ")) {
      return basicAuth.split("Basic ")[1]
    }
  }

  // No other auth routes
  return undefined
}
