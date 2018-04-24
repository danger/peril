import * as cookieParser from "cookie-parser"

/** Pulls out the JWT from the request, it can either be implicit via the cookies (client), or explicit in a header (server) */
export const getJWTFromRequest = (req: any) => {
  // Support JWT via cookies from the user session
  const cookieJWT = req && cookieParser.JSONCookies(req.cookies).jwt
  if (cookieJWT) {
    return cookieJWT
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
